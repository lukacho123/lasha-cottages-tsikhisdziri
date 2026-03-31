import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
}

export async function sendBookingConfirmation({
  guestEmail,
  guestName,
  cottageName,
  checkIn,
  checkOut,
  guestsCount,
  totalPrice,
  bookingId,
}: {
  guestEmail: string;
  guestName: string;
  cottageName: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  bookingId: string;
}) {
  await getResend().emails.send({
    from: 'ციხისძირი კოტეჯები <onboarding@resend.dev>',
    to: guestEmail,
    subject: `✅ ჯავშანი დადასტურდა — ${cottageName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: linear-gradient(135deg, #166534, #0f2744); padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ციხისძირი კოტეჯები</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">ჯავშანი წარმატებით გაიცა!</p>
        </div>

        <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #374151; font-size: 16px;">გამარჯობა, <strong>${guestName}</strong>!</p>
          <p style="color: #6b7280;">შენი ჯავშანი წარმატებით მიღებულია. ქვემოთ ნახავ დეტალებს:</p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #166534; margin: 0 0 16px; font-size: 20px;">🏡 ${cottageName}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">📅 შემოსვლა</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${checkIn}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">📅 გასვლა</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${checkOut}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">👥 სტუმრები</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${guestsCount}</td>
              </tr>
              <tr style="border-top: 1px solid #d1fae5;">
                <td style="padding: 12px 0; color: #166534; font-weight: 700; font-size: 18px;">💰 სულ</td>
                <td style="padding: 12px 0; color: #166534; font-weight: 700; font-size: 18px;">₾${totalPrice}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; font-size: 14px;">ჯავშნის ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${bookingId}</code></p>
        </div>

        <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="color: #374151; margin: 0 0 12px;">📞 კონტაქტი</h3>
          <p style="color: #6b7280; margin: 4px 0;">ტელეფონი: +995 555 000 000</p>
          <p style="color: #6b7280; margin: 4px 0;">ელ-ფოსტა: info@lasha-cottages.ge</p>
          <p style="color: #6b7280; margin: 4px 0;">მისამართი: ციხისძირი, აჭარა</p>
        </div>

        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
          © ${new Date().getFullYear()} ციხისძირი კოტეჯები
        </p>
      </div>
    `,
  });
}

export async function sendAdminBookingNotification({
  guestName,
  guestEmail,
  guestPhone,
  cottageName,
  checkIn,
  checkOut,
  guestsCount,
  totalPrice,
}: {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  cottageName: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await getResend().emails.send({
    from: 'ციხისძირი კოტეჯები <onboarding@resend.dev>',
    to: adminEmail,
    subject: `🔔 ახალი ჯავშანი — ${guestName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #166534;">ახალი ჯავშანი!</h2>
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; padding: 16px;">
          <tr><td style="padding: 8px; color: #6b7280;">სტუმარი</td><td style="padding: 8px; font-weight: 600;">${guestName}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">ელ-ფოსტა</td><td style="padding: 8px;">${guestEmail}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">ტელეფონი</td><td style="padding: 8px;">${guestPhone}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">კოტეჯი</td><td style="padding: 8px; font-weight: 600;">${cottageName}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">შემოსვლა</td><td style="padding: 8px;">${checkIn}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">გასვლა</td><td style="padding: 8px;">${checkOut}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">სტუმრები</td><td style="padding: 8px;">${guestsCount}</td></tr>
          <tr style="border-top: 2px solid #166534;"><td style="padding: 8px; color: #166534; font-weight: 700;">სულ</td><td style="padding: 8px; color: #166534; font-weight: 700; font-size: 18px;">₾${totalPrice}</td></tr>
        </table>
      </div>
    `,
  });
}
