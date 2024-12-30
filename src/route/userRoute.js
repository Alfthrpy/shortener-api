import express from 'express';
import mongoose from 'mongoose';
import User from '../../models/user.js';


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         links:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Link' 
 *     Link:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the link
 *         url:
 *           type: string
 *           description: The original URL
 *         shortenedUrl:
 *           type: string
 *           description: The shortened URL
 */

/**
 * @swagger
 * paths:
 *   /api/user:
 *     get:
 *       summary: Get all users
 *       tags:
 *         - Users
 *       responses:
 *         200:
 *           description: List of users
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/User'
 */


/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/{id}/links:
 *   get:
 *     summary: Get all links associated with a specific user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Links retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 links:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Link'
 *       400:
 *         description: Invalid User ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid User ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update user details by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid User ID or validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid User ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */



const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:id/links', async (req, res) => {
  const id = req.params.id;

  try {
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }
    const user = await User.findById(id).populate('links').exec();

   
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    return res.status(200).json({
      message: 'Links retrieved successfully',
      userId: id,
      links: user.links, 
    });
  } catch (error) {
    console.error('Error retrieving links:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



router
  .route('/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  .put(async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, email },
        { new: true, runValidators: true } 
      );
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ message: 'Update Successfully!', user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  // Delete user by ID
  .delete(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    try {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ message: 'Delete Successfully!', user: deletedUser });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

export default router;
