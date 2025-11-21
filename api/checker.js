export default async function handler(req, res) {
  const apiUrl = "https://rbxcrew.com/api/user/claim?id=3&_rsc=478ms";
  const expected = { success: false, text: "Not Authorized." };
  const webhookUrl = "https://discord.com/api/webhooks/1441352841217441845/HXBa8ITSY218xs_K4F47ABWNOuIDLYuWdP0YZHZv-J-p2wYsD2vWr3UI_9k3Z87FNcMr";

  try {
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();

    const isExpected = data.success === expected.success && data.text === expected.text;

    if (!isExpected) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `⚠️ ALERT: Unexpected API response!\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
        }),
      });
      return res.status(200).json({ status: "ERROR", data });
    }

    return res.status(200).json({ status: "OK", data });
  } catch (err) {
    return res.status(500).json({ status: "FAIL", error: err.message });
  }
}
