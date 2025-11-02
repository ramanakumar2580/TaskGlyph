// src/lib/email/sendReminder.ts
import { Resend } from "resend";

// Make sure to add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

interface MeetingDetails {
  id: string;
  title: string;
  notes: string | null;
  due_date: string; // This will be a timestamp
  meet_link: string | null;
  email: string; // The user's email
  reminderType: "30 minutes" | "20 minutes" | "10 minutes";
}

export async function sendMeetingReminder(meeting: MeetingDetails) {
  const { email, title, notes, due_date, meet_link, reminderType } = meeting;

  const subject = `Reminder: ${title} in ${reminderType}`;
  const meetingTime = new Date(parseInt(due_date)).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    <div>
      <h1>Reminder: ${title}</h1>
      <p>Your meeting is starting in <strong>${reminderType}</strong> at ${meetingTime}.</p>
      ${
        meet_link
          ? `<p><strong>Link:</strong> <a href="${meet_link}">${meet_link}</a></p>`
          : ""
      }
      ${notes ? `<p><strong>Description:</strong> ${notes}</p>` : ""}
    </div>
  `;

  try {
    await resend.emails.send({
      from: "TaskGlyph <reminders@yourdomain.com>", // You must verify a domain with Resend
      to: email,
      subject: subject,
      html: body,
    });
    console.log(`Email sent for ${title} to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
