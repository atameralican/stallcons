import { Resend } from "resend";

type ContactMailPayload = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    locale: "tr" | "en";
    sourcePage: string | null;
};

type ContactMailResult = {
    adminEmailSentAt: string | null;
    customerEmailSentAt: string | null;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactRequestEmails(
    payload: ContactMailPayload
): Promise<ContactMailResult> {
    const from = process.env.CONTACT_MAIL_FROM;
    const to = process.env.CONTACT_MAIL_TO;
    const publicEmail = process.env.CONTACT_PUBLIC_EMAIL || "info@stallcons.com";

    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY tanımlı değil.");
    }

    if (!from) {
        throw new Error("CONTACT_MAIL_FROM tanımlı değil.");
    }

    if (!to) {
        throw new Error("CONTACT_MAIL_TO tanımlı değil.");
    }

    const adminResult = await resend.emails.send({
        from,
        to,
        replyTo: payload.email,
        subject: `Yeni iletişim talebi: ${payload.subject}`,
        html: createAdminMailHtml(payload),
    });

    if (adminResult.error) {
        throw new Error(adminResult.error.message);
    }

    const adminEmailSentAt = new Date().toISOString();

    const customerResult = await resend.emails.send({
        from,
        to: payload.email,
        subject:
            payload.locale === "en"
                ? "Your request has been received"
                : "Talebiniz alınmıştır",
        html: createCustomerMailHtml(payload),
    });

    if (customerResult.error) {
        throw new Error(customerResult.error.message);
    }

    const customerEmailSentAt = new Date().toISOString();

    return {
        adminEmailSentAt,
        customerEmailSentAt,
    };
}

function createAdminMailHtml(payload: ContactMailPayload) {
    const fullName = `${payload.firstName} ${payload.lastName}`;
    const adminUrl = createAdminRequestUrl(payload.id);

    return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2>Yeni iletişim talebi</h2>

      <p>Web sitesi üzerinden yeni bir iletişim / fiyat teklifi talebi gönderildi.</p>

      <table style="border-collapse:collapse;width:100%;max-width:720px">
        ${tableRow("Ad Soyad", escapeHtml(fullName))}
        ${tableRow("E-posta", escapeHtml(payload.email))}
        ${tableRow("Telefon", escapeHtml(payload.phone || "-"))}
        ${tableRow("Konu", escapeHtml(payload.subject))}
        ${tableRow("Dil", escapeHtml(payload.locale))}
        ${tableRow("Kaynak Sayfa", escapeHtml(payload.sourcePage || "-"))}
      </table>

      <h3 style="margin-top:24px">Mesaj</h3>
      <div style="white-space:pre-wrap;border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#f9fafb">
        ${escapeHtml(payload.message)}
      </div>

      ${adminUrl
            ? `<p style="margin-top:24px">
              <a href="${adminUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">
                Admin panelde görüntüle
              </a>
            </p>`
            : ""
        }
    </div>
  `;
}

function createCustomerMailHtml(payload: ContactMailPayload) {
    const fullName = `${payload.firstName} ${payload.lastName}`;
    const publicEmail = process.env.CONTACT_PUBLIC_EMAIL || "info@stallcons.com";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const privacyUrl = siteUrl ? `${siteUrl}/privacy-policy` : null;
    const contactUrl = siteUrl
        ? `${siteUrl}/${payload.locale === "en" ? "en" : "tr"}/contact`
        : null;

    if (payload.locale === "en") {
        return `
      <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 12px">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
                <tr>
                  <td style="padding:28px 28px 20px;background:#111827;color:#ffffff">
                    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#d1d5db">
                      Stallcons
                    </p>
                    <h1 style="margin:0;font-size:24px;line-height:1.3">
                      Your request has been received
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6">
                      Hello ${escapeHtml(fullName)},
                    </p>

                    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151">
                      Thank you for contacting Stallcons. Your request has been successfully received.
                      Our team is reviewing your message and will contact you as soon as possible.
                    </p>

                    <div style="margin:24px 0;padding:18px;border-radius:14px;background:#f9fafb;border:1px solid #e5e7eb">
                      <p style="margin:0 0 10px;font-size:13px;color:#6b7280">
                        Request summary
                      </p>
                      <p style="margin:0;font-size:15px;color:#111827">
                        <strong>Subject:</strong> ${escapeHtml(payload.subject)}
                      </p>
                    </div>

                 <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#4b5563">
  This is an automatically generated email. Please do not reply to this message.
  For communication, please contact us at
  <a href="mailto:${escapeHtml(publicEmail)}" style="color:#111827;text-decoration:underline">
    ${escapeHtml(publicEmail)}
  </a>.
</p>

                    ${contactUrl
                ? `<p style="margin:24px 0">
                            <a href="${contactUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600">
                              Visit contact page
                            </a>
                          </p>`
                : ""
            }

                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />

                    <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280">
                      This is an automatic confirmation email sent because you submitted a contact form on Stallcons.
                      It is not a marketing or promotional email.
                    </p>

                    ${privacyUrl
                ? `<p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#6b7280">
                            You can review our privacy notice here:
                            <a href="${privacyUrl}" style="color:#111827;text-decoration:underline">Privacy Policy</a>
                          </p>`
                : ""
            }
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280">
                      Stallcons<br />
                      Email: ${escapeHtml(publicEmail)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
    }

    return `
    <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:28px 28px 20px;background:#111827;color:#ffffff">
                  <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#d1d5db">
                    Stallcons
                  </p>
                  <h1 style="margin:0;font-size:24px;line-height:1.3">
                    Talebiniz alınmıştır
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:28px">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6">
                    Merhaba ${escapeHtml(fullName)},
                  </p>

                  <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151">
                    Stallcons ile iletişime geçtiğiniz için teşekkür ederiz.
                    İletişim / fiyat teklifi talebiniz tarafımıza ulaşmıştır.
                    Ekibimiz talebinizi incelemektedir. En kısa sürede sizinle iletişime geçilecektir.
                  </p>

                  <div style="margin:24px 0;padding:18px;border-radius:14px;background:#f9fafb;border:1px solid #e5e7eb">
                    <p style="margin:0 0 10px;font-size:13px;color:#6b7280">
                      Talep özeti
                    </p>
                    <p style="margin:0;font-size:15px;color:#111827">
                      <strong>Konu:</strong> ${escapeHtml(payload.subject)}
                    </p>
                  </div>

                  <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#4b5563">
  Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postayı yanıtlamayın.
  İletişim için
  <a href="mailto:${escapeHtml(publicEmail)}" style="color:#111827;text-decoration:underline">
    ${escapeHtml(publicEmail)}
  </a>
  adresini kullanabilirsiniz.
</p>

                  ${contactUrl
            ? `<p style="margin:24px 0">
                          <a href="${contactUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600">
                            İletişim sayfasını ziyaret et
                          </a>
                        </p>`
            : ""
        }

                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />

                  <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280">
                    Bu e-posta, Stallcons web sitesindeki iletişim formu üzerinden talep oluşturduğunuz için otomatik olarak gönderilmiştir.
                    Reklam, kampanya veya pazarlama amaçlı bir ticari elektronik ileti değildir.
                  </p>

                  ${privacyUrl
            ? `<p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#6b7280">
                          Kişisel verilerinizin işlenmesine ilişkin bilgilendirme için
                          <a href="${privacyUrl}" style="color:#111827;text-decoration:underline">Aydınlatma Metni / Gizlilik Politikası</a>
                          sayfasını inceleyebilirsiniz.
                        </p>`
            : ""
        }
                </td>
              </tr>

              <tr>
                <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280">
                    Stallcons<br />
                    E-posta: ${escapeHtml(publicEmail)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function tableRow(label: string, value: string) {
    return `
    <tr>
      <td style="border:1px solid #e5e7eb;padding:10px;background:#f9fafb;font-weight:600;width:160px">
        ${label}
      </td>
      <td style="border:1px solid #e5e7eb;padding:10px">
        ${value}
      </td>
    </tr>
  `;
}

function createAdminRequestUrl(id: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) return null;

    return `${siteUrl.replace(/\/$/, "")}/admin/contact-requests?requestId=${id}`;
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}