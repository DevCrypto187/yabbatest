# YBDBD Game Bot Implementation Notes

## Invite System TODO

1. Bot Setup

   - [ ] Basic bot command structure
   - [ ] Set up proper error handling
   - [ ] Add logging system

2. Database Integration

   - [ ] Design schema for:
     - Users table (telegram_id, username, etc.)
     - Invite codes (code, creator_id, created_at)
     - Referrals (inviter_id, invited_id, code_used, timestamp)
     - Rewards tracking

3. Invite Flow

   - [ ] Basic /start command
   - [ ] Generate unique invite codes
   - [ ] Track who created which invite code
   - [ ] Validate invite codes
   - [ ] Prevent duplicate referrals
   - [ ] Handle edge cases (invalid codes, already referred users)

4. Reward System
   - [ ] Define reward amount (currently 2000)
   - [ ] Implement reward distribution
   - [ ] Add reward history
   - [ ] Add balance checking

## Current Bot Code (for reference)

```typescript
bot.command("start", async (ctx) => {
  const startPayload = ctx.message.text.split(" ")[1]; // Gets the invite code

  if (startPayload) {
    try {
      // Get inviter and new user info
      const newUser = ctx.from;
      const inviteCode = startPayload;

      // TODO: Look up who created this invite code from your database
      // const inviter = await db.findUserByInviteCode(inviteCode);

      // Send message to the new user
      await ctx.reply(
        `Welcome to YBDBD Game! 🎮\nYou've been invited by a friend!`
      );

      // Send notification to the inviter
      // await bot.telegram.sendMessage(inviter.telegramId,
      //   `🎉 ${newUser.first_name} joined using your invite link!\n` +
      //   `You've earned 2000 rewards! 🎁`
      // );

      // TODO: Save the referral relationship in your database
      console.log(
        `New user ${newUser.first_name} joined with code: ${startPayload}`
      );
      // await db.saveReferral({
      //   inviterId: inviter.id,
      //   newUserId: newUser.id,
      //   inviteCode: inviteCode
      // });

      // TODO: Credit rewards to the inviter
      // await creditRewards(inviter.id, 2000);
    } catch (error) {
      console.error("Error processing invite:", error);
      await ctx.reply("Sorry, there was an error processing the invitation.");
    }
  } else {
    await ctx.reply("Welcome to YBDBD Game! 🎮");
  }
});
```

## Next Steps

1. Set up development environment
2. Choose and set up database
3. Implement basic user tracking
4. Test invite flow end-to-end
