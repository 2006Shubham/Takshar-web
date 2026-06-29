const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Get user's network connections, pending requests, and discovery pool
// @route   GET /api/network
// @access  Private
const getNetwork = async (req, res) => {
    try {
        const userId = req.user.id; 

        // 1. Fetch ALL connections involving this user
        const allConnections = await Connection.find({
            $or: [{ from: userId }, { to: userId }]
        }).populate('from to', 'username role profileUrl createdAt');

        const connections = [];
        const pendingReceived = [];
        const pendingSent = [];
        const excludedUserIds = [userId]; // We don't want to show the user themselves in 'Discover'

        // 2. Categorize connections and track IDs to exclude from 'Discover'
        allConnections.forEach(conn => {
            if (!conn.from || !conn.to) return;
            const isSender = conn.from._id.toString() === userId.toString();
            const peer = isSender ? conn.to : conn.from;

            excludedUserIds.push(peer._id.toString());

            if (conn.status === 'Accepted') {
                connections.push({ connectionId: conn._id, peer });
            } else if (conn.status === 'Pending') {
                if (isSender) pendingSent.push({ connectionId: conn._id, peer });
                else pendingReceived.push({ connectionId: conn._id, peer });
            }
        });

        // 3. Fetch Discover Pool (Everyone NOT in the excluded list)
        const discoverPeers = await User.find({
            _id: { $nin: excludedUserIds }
        }).select('username role profileUrl createdAt');

        res.status(200).json({
            discover: discoverPeers,
            connections,
            pending: { received: pendingReceived, sent: pendingSent }
        });

    } catch (error) {
        console.error("Network fetch error:", error);
        res.status(500).json({ error: "Failed to load network data." });
    }
};

// @desc    Send connection request to a user
// @route   POST /api/connect
// @access  Private
const sendConnectionRequest = async (req, res) => {
    try {
        const { to } = req.body;
        const from = req.user.id;

        if (from === to) return res.status(400).json({ error: "Cannot connect to yourself." });

        const existing = await Connection.findOne({
            $or: [{ from, to }, { from: to, to: from }]
        });

        if (existing) return res.status(400).json({ error: "Connection already exists." });

        const newConnection = await Connection.create({ from, to });

        // Populate the 'to' user so the frontend can immediately add them to the 'Sent' tab
        await newConnection.populate('to', 'username role profileUrl createdAt');

        res.status(201).json(newConnection);
    } catch (error) {
        console.error("Connection send request error:", error);
        res.status(500).json({ error: "Failed to send request." });
    }
};

// @desc    Respond to a connection request (Accept / Decline)
// @route   PUT /api/network/respond
// @access  Private
const respondConnectionRequest = async (req, res) => {
    try {
        const { connectionId, action } = req.body; // 'Accepted' or 'Declined'
        const userId = req.user.id;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ error: "Connection request not found." });
        }

        // Ensure only the recipient can respond
        if (connection.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Not authorized to respond to this request." });
        }

        if (action === 'Accepted') {
            connection.status = 'Accepted';
            await connection.save();

            // Update both users' peer arrays
            await User.findByIdAndUpdate(connection.from, {
                $addToSet: { peers: connection.to }
            });
            await User.findByIdAndUpdate(connection.to, {
                $addToSet: { peers: connection.from }
            });

            return res.status(200).json({ message: "Connection accepted successfully.", connection });

        } else if (action === 'Declined') {
            await Connection.findByIdAndDelete(connectionId);
            return res.status(200).json({ message: "Connection declined and removed." });
        } else {
            return res.status(400).json({ error: "Invalid action." });
        }

    } catch (error) {
        console.error("Error responding to connection:", error);
        res.status(500).json({ error: "Failed to process response." });
    }
};

module.exports = {
    getNetwork,
    sendConnectionRequest,
    respondConnectionRequest
};
