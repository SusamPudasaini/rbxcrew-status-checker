export default async function handler(req, res) {
  const apiUrl = "https://rbxcrew.com/api/user/claim?id=3&_rsc=478ms";
  const expected = { success: false, text: "Not Authorized" };
  const webhookUrl = "https://discord.com/api/webhooks/1441352841217441845/HXBa8ITSY218xs_K4F47ABWNOuIDLYuWdP0YZHZv-J-p2wYsD2vWr3UI_9k3Z87FNcMr";

  let data = {};
  let alertNeeded = false;

  try {
    const apiRes = await fetch(apiUrl, { redirect: "follow" });
    try {
      data = await apiRes.json();
    } catch {
      const text = await apiRes.text();
      data = { raw: text };
      alertNeeded = true;
    }

    if (!(data.success === expected.success && data.text === expected.text)) {
      alertNeeded = true;
    }

  } catch (err) {
    data = { error: err.message };
    alertNeeded = true;
  }

  // Send Discord webhook if needed
  if (alertNeeded) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `⚠️ ALERT: RBXCrew API failed or unexpected response!\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
        }),
      });
    } catch (err) {
      console.error("Failed to send Discord webhook:", err);
    }
    return res.status(200).json({ status: "ERROR", data });
  }

  return res.status(200).json({ status: "OK", data });
};

// Node.js runtime + scheduled every minute
export const config = {
  runtime: "nodejs",
  schedule: "*/1 * * * *",
};
