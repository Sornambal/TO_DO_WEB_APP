const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.sendStatus(401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
};

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const task = new Task({ ...req.body, userId: req.userId });
    await task.save();
    res.json(task);
});

router.get('/', async (req, res) => {
    try {
        const { search, filter, sort } = req.query;
        let query = { userId: req.userId };
        
        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { desc: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter functionality
        if (filter) {
            if (filter === 'pending' || filter === 'completed') {
                query.status = filter;
            } else if (['Low', 'Medium', 'High'].includes(filter)) {
                query.priority = filter;
            }
        }
        
        // Sort functionality
        let sortOption = {};
        if (sort === 'asc') {
            sortOption = { date: 1 };
        } else if (sort === 'desc') {
            sortOption = { date: -1 };
        }
        
        const tasks = await Task.find(query).sort(sortOption);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

router.put('/:id', async (req, res) => {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

router.delete('/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
});

module.exports = router;
