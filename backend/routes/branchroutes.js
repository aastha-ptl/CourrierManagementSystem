const express = require("express");
const { addBranch, getAllBranches,getBranchesWithAdmins,updateBranch,deleteBranch } = require("../controller/Branchcontroller");
const { verifyToken, isAdmin } = require("../middleware/authmiddleware");

const router = express.Router();

// Add new branch
router.post("/addbranch", verifyToken, isAdmin, addBranch);

// Get all branches by name
router.get("/getallbranchesname", verifyToken, getAllBranches);
// Get all branches with their admins
router.get('/branches-with-admins', getBranchesWithAdmins);
// Update branch details
router.put('/update/:branchId', verifyToken, isAdmin, updateBranch);
// Delete branch
router.delete('/delete/:branchId', verifyToken, isAdmin, deleteBranch);


module.exports = router;
