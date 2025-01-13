const express = require("express")
const router = express.Router()
const imageCodeController = require("../controller/imageCodeController")

router.post("/createImages", imageCodeController.createImage)
router.get("/", imageCodeController.getAllImages)


module.exports = router