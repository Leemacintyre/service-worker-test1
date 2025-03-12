const express = require("express");
const app = express();
const webpush = require('web-push');
const cors = require("cors")
require('dotenv').config();

const port = process.env.PORT || 3000;

const apiKeys = {

    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
}

webpush.setVapidDetails(
  "mailto:push@example.com",
    apiKeys.publicKey,
    apiKeys.privateKey
)

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world");
})

const subscriptions = [];


// Save subscription
app.post("/save-subscription", (req, res) => {
    console.log("Request body:", req.body);
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ status: "Error", message: "Invalid subscription object" });
    }

    subscriptions.push(subscription);
    console.log("New Subscription Added:", subscription);
    res.status(201).json({ status: "Success", message: "Subscription saved!" });
});

// Send notification to all subscribed users
app.post("/send-notification", async (req, res) => {
    console.log({ subscriptions });
    if (subscriptions.length === 0) {
        return res.status(400).json({ status: "Error", message: "No subscriptions found" });
    }

    const notificationPayload = JSON.stringify({
        title: "New Notification!",
        body: "You have received a new message.",
    });

    const validSubscriptions = [];

    const sendPromises = subscriptions.map(async (subscription) => {
        try {
            console.log("Sending notification to:", subscription.endpoint);
            await webpush.sendNotification(subscription, notificationPayload);
            validSubscriptions.push(subscription); // Keep valid subscriptions
        } catch (err) {
            if (err.statusCode === 410) {
                console.warn("Subscription expired, removing:", subscription.endpoint);
            } else {
                console.error("Error sending notification:", err);
            }
        }
    });

    await Promise.all(sendPromises);
    subscriptions.length = 0; // Clear the old array
    subscriptions.push(...validSubscriptions); // Update with valid subscriptions

    res.status(200).json({ message: "Notifications sent successfully." });
});



app.listen(port, () => {
    console.log("Server running on port 3000!");
})


