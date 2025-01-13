const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const authenticateToken = require("../middleware/auth")


router.post("/signup", userController.createUser)
router.post("/login", userController.loginUser)
router.post("/saved-list", authenticateToken, userController.createUserList)
router.get("/saved-lists", authenticateToken, userController.getSavedList)
router.delete("/saved-list/:listId", authenticateToken, userController.deleteSavedList)
router.get("/saved-list/:listId", authenticateToken, userController.getListData)
router.post("/saved-list/:listId/image/:imageId", authenticateToken, userController.removeImageFromList)




module.exports = router