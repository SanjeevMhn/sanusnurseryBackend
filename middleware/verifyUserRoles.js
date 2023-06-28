const verifyUserRoles = (...allowedRoles) => {
    return (req,res,next) => {
        if(!req || !req.role_id){
            res.status(403).json({message:"Unauthenticated User"});
            return;
        }
        const rolesArr = [...allowedRoles];
        const result = rolesArr.includes(req.role_id);

        if(!result){
            res.status(403).json({message: "User doesnot have permission"})
            return;
        }

        next();
    }
}

module.exports = verifyUserRoles;