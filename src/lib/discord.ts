export const sendDiscordNotification = async (message: string) => {
  const webhookURL =
    "https://discord.com/api/webhooks/1306980512274845749/zre2t9CQ4luMm6WqiATkaO8eMsH28TlWQkBUwd1aCqgVcmFK64MKsp4N7cl9cjYFnWcy";

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      console.error(
        "Failed to send Discord notification:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error sending Discord notification:", error);
  }
};
