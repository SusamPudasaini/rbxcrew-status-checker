export default async function handler(req, res) {
  const apiUrl = "https://rbxcrew.com/api/user/claim?id=3&_rsc=478ms";

  const expected = { success: false, text: "Not Authorized" };

  const errorWebhook = "https://discord.com/api/webhooks/1441352841217441845/HXBa8ITSY218xs_K4F47ABWNOuIDLYuWdP0YZHZv-J-p2wYsD2vWr3UI_9k3Z87FNcMr";
  const okWebhook    = "https://discord.com/api/webhooks/1441393135509835879/NLCHpVVIBqxX0QwHJp8Chw-flTZSc3t-bydfGT0S6wH1LDshJzA5Ey_V6pGdxlFVqk2S";

  let data = {};
  let alertNeeded = false;

  try {
    const apiRes = await fetch(apiUrl, { redirect: "follow" });

    try {
      data = await apiRes.json();
    } catch {
      const text = await apiRes.text();
      data = { raw: text };
      alertNeeded = true; // invalid JSON triggers error
    }

    // Check if response matches expected
    if (!(data.success === expected.success && data.text === expected.text)) {
      alertNeeded = true;
    }

  } catch (err) {
    data = { error: err.message };
    alertNeeded = true; // network/fetch error triggers error
  }

  // Send Discord webhook based on status
  const webhookUrl = alertNeeded ? errorWebhook : okWebhook;
  const contentMsg = alertNeeded
    ? `⚠️ ALERT: RBXCrew API failed or unexpected response!\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
    : `✅ RBXCrew API OK\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: contentMsg }),
    });
  } catch (err) {
    console.error("Failed to send Discord webhook:", err);
  }

  return res.status(200).json({ status: alertNeeded ? "ERROR" : "OK", data });
}

// Node.js runtime + scheduled every minute
export const config = {
  runtime: "nodejs",
  schedule: "*/1 * * * *",
};
