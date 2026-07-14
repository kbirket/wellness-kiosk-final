Claude finished the response

Huh. I tried to say all the cards were printed and got this
Diagnosed computed field conflict and devised removal solution

That's a clean, fixable error: your "Requested Date" field in the Card Print Queue is a computed field (probably a "Created time" — it fills itself in automatically), so Airtable refuses when my route tries to write a value to it. It rejected the whole batch, which is why it says "0 cards logged" — nothing got created, so there's no mess to clean up.

The fix is just to stop writing that field and let Airtable populate it itself. Here's the corrected route:
Ran a command, read a file

Just swap in this updated app/api/bulk-log-cards/route.js (attached) — the only change is it no longer tries to write "Requested Date," so Airtable will fill that in on its own like it normally does. Everything else (Member, Requested By, Status, Print Type, Printed Date, and Issued Date when applicable) still gets written.
javascript

const fields = {
  'Member': [id],
  'Requested By': requestedBy || 'Bulk Print',
  'Status': st,
  'Print Type': printType || 'Fob',
  'Printed Date': today
};
if (st === 'Issued') {
  fields['Issued Date'] = today;
}

Since it failed before creating anything, you're safe to just deploy this and run it again — no duplicates to worry about.

One thing to check while you're in Airtable, so the next field doesn't trip you the same way: make sure "Printed Date" (and "Issued Date" if you added it) are plain Date fields, not computed ones. The single "Mark Printed" button already writes to "Printed Date" successfully, so it's almost certainly fine — but since you're now writing all of them in one batch, if any other field in that table is a formula or created-time type, Airtable will reject the whole batch the same way. If you hit another "cannot accept a value because the field is computed" error, tell me which field it names and I'll pull it from the route.
Bulk log cards route
JS 

From Deanna: ACH payments are deducted twice a month (customer's choice of the 3rd or the 18th of the month) for the calendar month the draft is taken in. When I enter the payments as the drafts occur in the Wellness Hub, the member file will show as not paid until the 3rd or the 18th of the month causing the customer concern or unable to check in. Most after-hour customers are through ACH withdrawal.  How do I handle this? Suggestions?
Architected system alignment between ACH draft dates and payment-due logic

This is a real workflow gap, and a good catch by Deanna. Let me look at how your payment-due date and the stoplight actually work so my suggestions are grounded in your system, not generic.
Diagnosed ACH timing gap and synthesized practical solutions

Deanna's spotted a genuine design gap, and it's a good one. Let me restate it to make sure I've got it, then give you real options.

The root of it: your due-date logic puts a member's "Next Payment Due" on the 1st of the month, but the ACH draft — and the moment you actually enter it — doesn't happen until the 3rd or the 18th. So from the 1st until you key in the draft, the system thinks they haven't paid. For 18th-draft members that's a ~17-day window of showing "unpaid," and since after-hours members are mostly ACH with no staff to override, they get stuck at the door. The system is essentially penalizing people for a payment date they didn't choose and that's automatic anyway.

Here are three ways to handle it, lightest to most complete:

1. Immediate workaround (no code, do it today). You can already edit "Next Payment Due" on the member's profile. For your ACH members, set that date to their draft day (3rd or 18th) instead of letting it sit on the 1st. Then they don't read as "due" until the day the money actually moves. It's manual and per-member, so it's fine as a stopgap but tedious across a lot of members.

2. A grace buffer at check-in (quick code change). I widen the window before someone is blocked so nobody gets turned away until, say, a week after the 18th. Simple, but it's blunt — it loosens the grace for everyone, not just ACH folks, and a very late entry could still gap.

3. Proper ACH handling (my recommendation). Add an "Auto-Pay (ACH)" toggle and a draft day (3rd / 18th) to the member. Then two things happen automatically:

    Their due date lands on their draft day, not the 1st — so the "unpaid" gap mostly disappears on its own.
    They get a grace window for a few days after the draft day, so the lag between the draft clearing and you entering it never flips them to blocked. During that window they still check in fine (critical for after-hours), and you'd only ever see a real problem if a draft actually fails — which you'd mark yourself.

This is essentially the same move we just made for corporate members: the person isn't at fault for the timing, so we don't lock them out — the money's coming.

My honest recommendation is #3 — it fixes it permanently and matches how ACH actually works, and #1 gets you through until it's built.

If you want #3, I can build it. One thing I'll likely need from you: the file that handles logging payments (app/api/log-payment/route.js or wherever your "Next Payment Due" gets advanced) — that's where I'd make ACH members advance to their draft day instead of the 1st. Paste that and I'll wire the whole thing. Want me to go ahead?

Let's do #3
Architected ACH payment system with grace periods and UI integration

Great — #3 it is. This spans three files (the member data + stoplight + UI in page.tsx, the whitelist in update-onboarding, and the due-date math in log-payment). Let me build it in stages. First let me confirm my anchors and find where to put the toggle on the profile.
Deliberated form integration strategy for new fields

Let me see how the edit form saves, so I add the ACH fields to the right place.
Architected phased implementation strategy for ACH payment feature

This is a multi-file feature, so I'll build it in stages and compile-check each. Let me get the full stoplight function and the member-mapping spot.
Architected payment logic updates across multiple application routes

All confirmed. Stage 1 — the data plumbing and the stoplight grace logic:
Navigated codebase to integrate UI toggle functionality

Stage 1 compiles clean. Now Stage 2 — the toggle UI. Let me find where the onboarding box lives on the profile so I can place the ACH control consistently.
Architected ACH card placement within onboarding interface

The onboarding section is the right home (always visible, uses the save mechanism I control). Let me add the ACH toggle + draft-day picker there.
Architected route modifications for payment processing and member data integration

Now the two routes. First, the updated update-onboarding whitelist (adding the two ACH fields), then log-payment for the due-date math:
Ran 2 commands, read a file

Full ACH feature built across all three files (everything compiles clean). Here's what it does end to end:

On the member profile, there's a new "Auto-Pay (ACH)" card. Flip it on for a member, and a "Draft day" picker appears — 3rd or 18th. Deanna sets each ACH member to their chosen day.

When you log that member's payment (log-payment route), their Next Payment Due now advances to their draft day of the next month instead of the 1st. So an 18th-draft member's due date sits on the 18th — right when the money actually moves — instead of the 1st, which erased most of the gap on its own.

The stoplight (getStoplight) gives ACH members a 7-day grace after their draft day. During that window they stay green — not blocked, and no "unpaid" alarm that worries them — so the lag between the draft posting and you entering it never locks anyone out. This is exactly the after-hours ACH problem solved: they sail through. Only if a draft actually fails and goes unentered for over a week do they flip to red, which is the one case you'd genuinely want flagged.

Deploy all three files, then in Airtable's Members table add the two fields (names must match exactly):

    Auto-Pay ACH — Checkbox
    ACH Draft Day — Number (Deanna will set these to 3 or 18 per member via the app)

How to roll it out with Deanna: deploy, add the two Airtable fields, then go through the ACH members and flip the toggle + set each one's draft day. From their next logged draft forward, their due date self-aligns and the after-hours lockouts stop.

Two honest notes:

The alignment kicks in on the next payment you log for each member — it doesn't retroactively move their current due date. If someone's mid-cycle and already showing a due date on the 1st, you can either wait for their next draft to self-correct, or manually set their Next Payment Due to their draft day once to bridge it.

And for ACH families, logging one member's draft still advances the whole family to that same draft-day due date, which is what you want as long as the family drafts together. If a family somehow splits draft days, tell me and we'll handle that case.
Page
Code · TSX 
Log payment route
JS 
Update onboarding route
JS 

What if they have 2 draft days in their month
Architected dual-draft billing model with alternating due dates

Ah — important clarification. My build assumed each member picks one day. If some members draft on both the 3rd and the 18th (splitting the month into two installments), I need to handle that. Let me extend it — and I'll flag my assumption about how those two drafts work so you can correct me if it's different.
Reconsidered handling multiple draft preferences within billing cycles

Now the log-payment route needs the "Both" logic — for a twice-monthly member, each draft points the due date at the next one in the cycle. Let me rewrite it:
Ran a command, read a file

Now the draft-day picker has three choices: 3rd only, 18th only, or Both (3rd & 18th) — and the "Both" case is handled (updated page.tsx and log-payment-route.js attached, both compile clean).

Here's how I built "Both," and this is the assumption I want you to check: I treated it as a member who splits their monthly dues into two installments — half on the 3rd, half on the 18th, both for the same month. So each draft points the due date at the next one in the cycle: logging the 3rd's draft sets the due date to the 18th of the same month; logging the 18th's draft sets it to the 3rd of next month. It figures out which draft you're entering from the payment date (early month = the 3rd's, later = the 18th's). Combined with the 7-day grace, they stay green all month as their two drafts come through, and it'll only flag if one actually fails and goes unentered for over a week.

Since I'm now using words instead of numbers for the draft day, one small change to the Airtable setup: make ACH Draft Day a Single select (not Number) with three options — 3rd, 18th, Both. (If you already made it a Number, just change the field type; the app writes those exact words.)

Now the part I need you to confirm, because it changes the math: when a "Both" member drafts twice, are those two drafts each half of one month's dues (two installments for the same month)? That's what I assumed. If instead each draft is a full month's payment (e.g., they're paying two months at once, or it's two separate memberships), the cycle logic would be different and I'd wire it another way. Tell me which it is and I'll make sure it matches how the money actually works.

One more thing worth a beat: if a "Both" member is also at the Anthony center, the ACH draft-day logic now takes priority over Anthony's "1st of the month" rule — which is what you want (the draft days should win). Just flagging it so it's not a surprise.
Page
Code · TSX 
Log payment route
JS 


Claude is AI and can make mistakes. Please double-check responses.
Log payment route · JS
import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const { airtableId, method, currentDueDate, amount, paymentDate, note } = await request.json();
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
 
    // 1. Look up the member's Home Center + Family Group + Auto-Pay (ACH) settings
    let memberCenter = '';
    let familyGroupId = '';
    let achAutoPay = false;
    let achDraftPref = '3rd';
    try {
      const lookupRes = await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const lookupData = await lookupRes.json();
      memberCenter = (lookupData.fields && lookupData.fields['Home Center']) || '';
      const famField = lookupData.fields && lookupData.fields['Family Group'];
      if (Array.isArray(famField) && famField.length > 0) familyGroupId = famField[0];
      else if (typeof famField === 'string') familyGroupId = famField;
      achAutoPay = !!(lookupData.fields && lookupData.fields['Auto-Pay ACH']);
      const rawPref = lookupData.fields && lookupData.fields['ACH Draft Day'];
      if (rawPref === '18th' || rawPref === 18) achDraftPref = '18th';
      else if (rawPref === 'Both') achDraftPref = 'Both';
      else achDraftPref = '3rd';
    } catch (e) {
      memberCenter = '';
      familyGroupId = '';
    }
    const isAnthony = memberCenter.toLowerCase().includes('anthony');
 
    // 2. Calculate the NEW due date
    let nextDate;
    if (paymentDate) {
        nextDate = new Date(paymentDate + 'T00:00:00');
    } else {
        nextDate = new Date();
    }
    if (achAutoPay) {
      if (achDraftPref === 'Both') {
        // Twice-a-month member: each draft points the due date at the NEXT draft in the cycle.
        // A payment near the start of the month is the 3rd's draft -> next is the 18th of the SAME month.
        // A payment later in the month is the 18th's draft -> next is the 3rd of NEXT month.
        const payDay = nextDate.getDate();
        if (payDay <= 10) {
          nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 18);
        } else {
          nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 3);
        }
      } else {
        // Single draft day: due lands on that same day next month.
        const day = achDraftPref === '18th' ? 18 : 3;
        nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, day);
      }
    } else if (isAnthony) {
      nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    const nextPaymentDue = nextDate.toLocaleDateString('en-CA');
 
    // 3. Create the Payment Record
    const payAmount = Number(amount) || 0;
    const checkNum = method.startsWith('Check #') ? method.replace('Check #', '') : '';
    const payMethod = method.startsWith('Check') ? 'Check' : method;
    const userNote = note && note.trim() ? note.trim() : '';
    const baseNote = checkNum
        ? 'Check #' + checkNum + ' - Logged by staff via Wellness Hub'
        : 'Logged by staff via Wellness Hub';
    const noteText = userNote ? userNote + ' | ' + baseNote : baseNote;
    const payFields = {
      "Member": [airtableId],
      "Amount": payAmount,
      "Payment Date": paymentDate || new Date().toISOString().split('T')[0],
      "Payment Method": payMethod,
      "Status": "Completed",
      "Notes": noteText
    };
 
    if (checkNum) payFields["Check Number"] = checkNum;
    const payRes = await fetch(`https://api.airtable.com/v0/${baseId}/Payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ fields: payFields }]
      })
    });
 
    const payData = await payRes.json();
 
    if (!payRes.ok || payData.error) {
      console.error('Payment record error:', payData.error || payData);
      return NextResponse.json({ success: false, error: 'Failed to save payment in Airtable' }, { status: 400 });
    }
 
    // 4. Update the Member record
    const memberFields = {
      "Next Payment Due": nextPaymentDue,
      "Membership Status": "Active",
    };
 
    if (checkNum) {
      memberFields["Check Number"] = checkNum;
    } else {
      memberFields["Check Number"] = null;
    }
    const memRes = await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: memberFields
      })
    });
 
    const memData = await memRes.json();
 
    if (!memRes.ok || memData.error) {
      console.error('Member update error:', memData.error || memData);
      return NextResponse.json({ success: false, error: 'Failed to update member in Airtable' }, { status: 400 });
    }
 
    // 5. If the payer is part of a family, advance Next Payment Due for all other family members too
    let familyMembersUpdated = 0;
    if (familyGroupId) {
      try {
        const filterFormula = encodeURIComponent(`AND(FIND('${familyGroupId}', ARRAYJOIN({Family Group})), RECORD_ID()!='${airtableId}')`);
        const famRes = await fetch(
          `https://api.airtable.com/v0/${baseId}/Members?filterByFormula=${filterFormula}&maxRecords=20`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const famData = await famRes.json();
        if (famData.records && famData.records.length > 0) {
          const updates = famData.records.map(rec => ({
            id: rec.id,
            fields: {
              "Next Payment Due": nextPaymentDue,
              "Membership Status": "Active"
            }
          }));
          for (let i = 0; i < updates.length; i += 10) {
            const batch = updates.slice(i, i + 10);
            await fetch(`https://api.airtable.com/v0/${baseId}/Members`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ records: batch })
            });
          }
          familyMembersUpdated = updates.length;
        }
      } catch (famErr) {
        console.error('Family update failed:', famErr);
      }
    }
 
    return NextResponse.json({
      success: true,
      nextPaymentDue,
      paymentSaved: true,
      memberUpdated: true,
      familyMembersUpdated
    });
 
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
 

