import 'dotenv/config';
import fetch from 'node-fetch';
import { findWorkItemById } from '../repo/work-items';

class Notifier {
  /**
   * Sends a notification to the user letting them know the work request status changed.
   * The user profile determines which transport mechanisms get the notification (email, txt, Discord, etc).
   * @param {*} userProfile
   * @param {*} workRequest
   * @returns
   */
  async notifyWorkRequestStatusChanged(userProfile, workRequest) {
    if (!userProfile) throw new Error(`There is no user profile ... cannot get the profile information to notify the user about the work request status change.`);
    if (!workRequest) throw new Error(`There is no work request ... cannot notify about the work request status change.`);

    // No reason to go any further if there is no metadata
    if (!userProfile.user_metadata) {
      console.log(`There was no metadata on the user profile ${JSON.stringify(userProfile)}`);
      return;
    }

    // Get the work item details to create the message
    const workItem = findWorkItemById(workRequest.workItemId);

    // Get the user friendly Id
    let id = workRequest._id.toString().toUpperCase();
    id = id.substring(id.length - 5);

    // If the worker has Discord, let them know they were just assigned a work item
    if (userProfile.user_metadata.discordid) {
      let message = '';
      let embeds = [];

      // The message should vary depending on the status
      if (workRequest.status === 'open') {
        message = `Hey <@${userProfile.user_metadata.discordid}>, stop MineTubing ... You have work to do!`;
        embeds.push({
          title: `${workItem.name} for $${workRequest.price}`,
          url: `${process.env.BASE_URL}/work-requests/detail.html?id=${workRequest._id}`,
          description: `${workRequest.instructions}\n#${id}`,
          thumbnail: { url: `${process.env.BASE_URL + workItem.imageUrl}`}
        });
      } else {
        // Sanitize the status
        const status = workRequest.status.replace(/_/g, ' ').toUpperCase();

        message = `<@${userProfile.user_metadata.discordid}>, a work request just got updated.`;
        embeds.push({
          title: `${workItem.name} for $${workRequest.price}`,
          url: `${process.env.BASE_URL}/work-requests/detail.html?id=${workRequest._id}`,
          description: `#${id} is now **${status}**`,
          thumbnail: { url: `${process.env.BASE_URL + workItem.imageUrl}`}
        });
      }

      console.log(`Posting Discord notification...`);
      await this.sendDiscordNotification(message, embeds);
    }
  }

  /**
   * Sends a message to Discord using a webhook.
   * See https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html
   * @param {string} message - The content of the message to send.
   * @param {Array} embeds - Optional list of embed objects to send with the message.
   */
  async sendDiscordNotification (message, embeds) {
    if (!message) throw new Error(`Cannot send an empty message to Discord.`);
    if (embeds && !Array.isArray(embeds)) throw new Error(`Cannot send the message to Discord. Make sure the embeds are an array which has at least one object in it.`);

    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: message, embeds: embeds })
    });
  }
}

export { Notifier };
