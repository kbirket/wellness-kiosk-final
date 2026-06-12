export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { keeperAirtableId, duplicateAirtableId, duplicateMemberId, mergedBy } = await request.json();

    if (!keeperAirtableId || !duplicateAirtableId || !duplicateMemberId) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (keeperAirtableId === duplicateAirtableId) {
      return Response.json({ success: false, error: 'Cannot merge a member with themselves' }, { status: 400 });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

    // Step 1: Get the keeper's current Legacy Member IDs so we can append
    const keeperRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + keeperAirtableId, { headers });
    const keeperData = await keeperRes.json();
    if (!keeperRes.ok || keeperData.error) {
      return Response.json({ success: false, error: 'Could not load keeper member: ' + (keeperData.error?.message || 'unknown') }, { status: 500 });
    }
    const existingLegacy = keeperData.fields['Legacy Member IDs'] || '';
    const newLegacy = existingLegacy ? existingLegacy + ',' + duplicateMemberId : duplicateMemberId;

    // Step 2: Get the duplicate's record (we'll need their notes for the merge log)
    const dupeRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + duplicateAirtableId, { headers });
    const dupeData = await dupeRes.json();
    if (!dupeRes.ok || dupeData.error) {
      return Response.json({ success: false, error: 'Could not load duplicate member: ' + (dupeData.error?.message || 'unknown') }, { status: 500 });
    }
    const dupeName = (dupeData.fields['First Name'] || '') + ' ' + (dupeData.fields['Last Name'] || '');

    // Step 3: Find and re-link all Payments belonging to the duplicate
    // Airtable paginates at 100 records, so loop until done
    let allPayments = [];
    let offset = null;
    do {
      const url = 'https://api.airtable.com/v0/' + baseId + '/Payments?filterByFormula=' +
        encodeURIComponent("FIND('" + duplicateAirtableId + "', ARRAYJOIN({Member})) > 0") +
        (offset ? '&offset=' + offset : '');
      const payRes = await fetch(url, { headers });
      const payData = await payRes.json();
      if (!payRes.ok || payData.error) {
        return Response.json({ success: false, error: 'Could not fetch payments: ' + (payData.error?.message || 'unknown') }, { status: 500 });
      }
      allPayments = allPayments.concat(payData.records || []);
      offset = payData.offset || null;
    } while (offset);

    // Re-link payments in batches of 10 (Airtable's batch limit)
    for (let i = 0; i < allPayments.length; i += 10) {
      const batch = allPayments.slice(i, i + 10).map(rec => ({
        id: rec.id,
        fields: { 'Member': [keeperAirtableId] }
      }));
      const linkRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Payments', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: batch })
      });
      const linkData = await linkRes.json();
      if (!linkRes.ok || linkData.error) {
        return Response.json({ success: false, error: 'Could not re-link payments: ' + (linkData.error?.message || 'unknown') }, { status: 500 });
      }
    }

    // Step 4: Find and re-link all Visits belonging to the duplicate
    let allVisits = [];
    offset = null;
    do {
      const url = 'https://api.airtable.com/v0/' + baseId + '/Visits?filterByFormula=' +
        encodeURIComponent("FIND('" + duplicateAirtableId + "', ARRAYJOIN({Member})) > 0") +
        (offset ? '&offset=' + offset : '');
      const visRes = await fetch(url, { headers });
      const visData = await visRes.json();
      if (!visRes.ok || visData.error) {
        return Response.json({ success: false, error: 'Could not fetch visits: ' + (visData.error?.message || 'unknown') }, { status: 500 });
      }
      allVisits = allVisits.concat(visData.records || []);
      offset = visData.offset || null;
    } while (offset);

    for (let i = 0; i < allVisits.length; i += 10) {
      const batch = allVisits.slice(i, i + 10).map(rec => ({
        id: rec.id,
        fields: { 'Member': [keeperAirtableId] }
      }));
      const linkRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Visits', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: batch })
      });
      const linkData = await linkRes.json();
      if (!linkRes.ok || linkData.error) {
        return Response.json({ success: false, error: 'Could not re-link visits: ' + (linkData.error?.message || 'unknown') }, { status: 500 });
      }
    }

    // Step 5: Find and re-link all Card Print Queue records belonging to the duplicate
    let allCards = [];
    offset = null;
    do {
      const url = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Card Print Queue') + '?filterByFormula=' +
        encodeURIComponent("FIND('" + duplicateAirtableId + "', ARRAYJOIN({Member})) > 0") +
        (offset ? '&offset=' + offset : '');
      const cardRes = await fetch(url, { headers });
      const cardData = await cardRes.json();
      if (!cardRes.ok || cardData.error) {
        // Don't fail the whole merge if Card Print Queue table doesn't exist or has issues
        console.warn('Could not fetch card queue:', cardData.error?.message);
        break;
      }
      allCards = allCards.concat(cardData.records || []);
      offset = cardData.offset || null;
    } while (offset);

    for (let i = 0; i < allCards.length; i += 10) {
      const batch = allCards.slice(i, i + 10).map(rec => ({
        id: rec.id,
        fields: { 'Member': [keeperAirtableId] }
      }));
      await fetch('https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Card Print Queue'), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: batch })
      });
    }

    // Step 6: Update the keeper - append legacy ID
    const keeperUpdateRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + keeperAirtableId, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        fields: { 'Legacy Member IDs': newLegacy }
      })
    });
    const keeperUpdateData = await keeperUpdateRes.json();
    if (!keeperUpdateRes.ok || keeperUpdateData.error) {
      return Response.json({ success: false, error: 'Could not update keeper: ' + (keeperUpdateData.error?.message || 'unknown') }, { status: 500 });
    }

    // Step 7: Mark the duplicate as Inactive + Merged with a note
    const mergeDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const existingDupeNotes = dupeData.fields['Notes'] || '';
    const mergeNote = '[' + mergeDate + '] Merged into ' + (keeperData.fields['Member ID'] || keeperAirtableId) + ' by ' + (mergedBy || 'Staff') + '. Payments, visits, and card requests re-linked.';
    const finalDupeNotes = existingDupeNotes.trim() === '' ? mergeNote : existingDupeNotes + '\n' + mergeNote;

    const dupeUpdateRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + duplicateAirtableId, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        fields: {
          'Inactive': true,
          'Merged': true,
          'Notes': finalDupeNotes
        }
      })
    });
    const dupeUpdateData = await dupeUpdateRes.json();
    if (!dupeUpdateRes.ok || dupeUpdateData.error) {
      return Response.json({ success: false, error: 'Could not mark duplicate as merged: ' + (dupeUpdateData.error?.message || 'unknown') }, { status: 500 });
    }

    return Response.json({
      success: true,
      paymentsRelinked: allPayments.length,
      visitsRelinked: allVisits.length,
      cardsRelinked: allCards.length,
      duplicateName: dupeName.trim()
    });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
