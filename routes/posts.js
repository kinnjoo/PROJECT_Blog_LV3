const express = require("express");
const router = express.Router();

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const Posts = require("../schemas/post.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 게시글 목록 조회 API
router.get("/posts", async (req, res) => {
  const posts = await Posts.find({}).sort({ createdAt: -1 });

  const postList = posts.map((post) => {
    return {
      postId: post._id,
      nickname: post.nickname,
      title: post.title,
      createdAt: post.createdAt
    }
  })
  res.status(200).json({ posts: postList });
});

// 게시글 상세 조회 API
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ errorMessage: "postId 형식이 올바르지 않습니다." });
  }

  const detail = await Posts.findOne({ _id: postId });

  if (detail) {
    const postDetail = {
      postId: detail._id,
      nickname: detail.nickname,
      title: detail.title,
      content: detail.content,
      createdAt: detail.createdAt
    }
    res.json({ post: postDetail });
  } else {
    res.status(404).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  const { nickname } = res.locals.user;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ errorMessage: "게시글 제목 또는 내용이 비어있습니다." });
  } else {
    await Posts.create({ title, content, nickname });
    return res.status(200).json({ message: "게시글을 생성하였습니다." });
  }
});

// 게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ errorMessage: "postId 형식이 올바르지 않습니다." });
  }

  const findPostId = await Posts.findOne({ _id: postId });

  if (!findPostId) {
    return res.status(404).json({ errorMessage: "게시글 조회에 실패하였습니다." })
  } else if (user.nickname !== findPostId.nickname) {
    return res.status(403).json({ errorMessage: "게시글의 수정 권한이 존재하지 않습니다." });
  } else if (!title || !content) {
    return res.status(412).json({ errorMessage: "게시글 제목 또는 내용이 비어있습니다." });
  } else {
    await Posts.updateOne(
      { _id: postId },
      { $set: { title, content } });
    return res.status(200).json({ message: "게시글을 수정하였습니다." });
  }
});

// 게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const user = res.locals.user;
  const { postId } = req.params;

  if (!ObjectId.isValid(postId)) {
    return res.status(400).json({ errorMessage: "postId 형식이 올바르지 않습니다." });
  }

  const findPostId = await Posts.findOne({ _id: postId });

  if (!findPostId) {
    return res.status(404).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  } else if (user.nickname !== findPostId.nickname) {
    return res.status(403).json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
  } else {
    await Posts.deleteOne({ _id: postId });
    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  }
});

module.exports = router;