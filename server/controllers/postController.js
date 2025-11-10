const Post = require('../models/Post'); 

// --- 1. Get ALL Posts Controller ---
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate('author', 'name email role');
            
        res.status(200).json(posts);
    } catch (error) {
        console.error("ERROR FETCHING FULL POSTS:", error.message);
        res.status(500).json({ message: 'Server error fetching posts.' });
    }
};

// --- 2. Get LATEST Post Controller ---
const getLatestPost = async (req, res) => {
    try {
        const post = await Post.findOne({})
            .sort({ createdAt: -1 })
            .populate('author', 'name email role'); 
        
        res.status(200).json(post); 
    } catch (error) {
        console.error("ERROR FETCHING LATEST POST:", error.message);
        res.status(500).json({ message: 'Server error fetching latest post.' });
    }
};

// --- 3. Create Post Controller ---
const createPost = async (req, res) => {
    const { content } = req.body;
    const mediaFile = req.file; 

    let mediaType = 'none';
    let mediaUrl = null;

    if (mediaFile) {
        mediaUrl = `/uploads/${mediaFile.filename}`; 
        if (mediaFile.mimetype.startsWith('image/')) {
            mediaType = 'image';
        } else if (mediaFile.mimetype.startsWith('video/')) {
            mediaType = 'video';
        }
    }

    try {
        const post = new Post({
            author: req.user._id, 
            content: content || null, 
            mediaUrl, 
            mediaType, 
        });

        let createdPost = await post.save();
        createdPost = await createdPost.populate('author', 'name email role'); 
        
        res.status(201).json(createdPost);

    } catch (error) {
        console.error("ERROR CREATING POST WITH MEDIA:", error.message);
        res.status(500).json({ message: 'Server error creating post.' });
    }
};

// --- 4. Get Post By ID Controller ---
const getPostById = async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId).populate('author', 'name email role');
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ message: 'Invalid post ID format.' });
    }
};

// --- 5. Update Post Controller ---
const updatePost = async (req, res) => {
    const postId = req.params.postId;
    const { content, mediaUrl } = req.body; 
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this post.' });
        }
        
        post.content = content || post.content;
        post.mediaUrl = mediaUrl || post.mediaUrl;

        const updatedPost = await post.save();

        res.status(200).json(updatedPost);

    } catch (error) {
        console.error("ERROR UPDATING POST:", error.message);
        res.status(500).json({ message: 'Server error updating post.' });
    }
};

// --- 6. Delete Post Controller ---
const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this post.' });
        }

        await Post.deleteOne({ _id: postId }); 

        res.status(200).json({ message: 'Post deleted successfully.' });

    } catch (error) {
        console.error("ERROR DELETING POST:", error.message);
        res.status(500).json({ message: 'Server error deleting post.' });
    }
};

// --- 7. LIKE/UNLIKE Post Controller (CRITICAL FIX FOR CRASH) ---
const likePost = async (req, res) => {
    const userId = req.user._id; 
    const postId = req.params.postId;
    const { action } = req.body;

    try {
        // 1. Find the post and determine current like status
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const isCurrentlyLiked = post.likes.includes(userId);
        
        let updateOperator = {};

        if (action === 'like' && !isCurrentlyLiked) {
            // User wants to like: Use $addToSet (ensures no duplicates)
            updateOperator = { $addToSet: { likes: userId } };
        } else if (action === 'unlike' && isCurrentlyLiked) {
            // User wants to unlike: Use $pull
            updateOperator = { $pull: { likes: userId } };
        } else {
            // No action needed (already liked/unliked)
            const responseData = {
                likesCount: post.likes.length,
                isLikedByUser: isCurrentlyLiked,
                message: "No change to like status."
            };
            return res.status(200).json(responseData);
        }

        // 2. Perform ATOMIC UPDATE and get the NEW document
        // This avoids validation errors for missing 'author' field.
        const updatedPost = await Post.findByIdAndUpdate(postId, updateOperator, { new: true });

        // 3. Prepare response data using the updatedPost
        const responseData = {
            likesCount: updatedPost.likes.length,
            isLikedByUser: updatedPost.likes.includes(userId),
            message: `Post successfully ${action}d.`
        };

        res.status(200).json(responseData); 

    } catch (error) {
        console.error("ERROR LIKING/UNLIKING POST:", error.message);
        // This will now catch the JWT malformed error if it happens again.
        res.status(500).json({ message: 'Server error processing like.' });
    }
};


// --- FINAL EXPORT METHOD ---
module.exports = {
    getPosts,      
    getLatestPost,
    createPost,
    getPostById,
    updatePost,
    deletePost,
    likePost,      
};