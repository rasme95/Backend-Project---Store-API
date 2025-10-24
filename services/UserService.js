class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
    }

    async create( userName, email, firstName, lastName, address, phone, encryptedPassword, salt, membershipId, roleId ) {
        return this.User.create({
            userName: userName,
            email: email,
            firstName: firstName,
            lastName: lastName,
            address: address,
            phone: phone,
            encryptedPassword: encryptedPassword,
            salt: salt,
            MembershipId: membershipId,
            RoleId: roleId,
        });
    }

    async updatePurchases(Id, purchases) {
        return this.User.update(
            {
                purchases: purchases,
            }, { where: { Id: Id } });
    }

    async updateMembership(Id, MembershipId) {
        return this.User.update(
            {
                MembershipId: MembershipId,
            }, { where: { Id: Id } });
    }


    async get() {
        return this.User.findAll({
            where: {
            }
        }).catch(err => {
            return (err)
        })
    }

    async update(id, firstName, lastName, address, phone, role) {
        return this.User.update(
            { firstName: firstName, lastName: lastName, address: address, phone: phone, RoleId: role },
            { where: { Id: id } }
        );
    }

    async updateLoggedInState(loggedIn, id) {
        return this.User.update(
            {
                loggedIn: loggedIn
            }, { where: { id: id } });
    }

    async getByEmail(email) {
        return this.User.findOne({ where: { email } });
    }

    async getByUsername(username) {
        return this.User.findOne({ where: { username } });
    }

    async getByLogin(login) {
        let user = await this.getByEmail(login);
        if (user) {
            return user; 
        }
        return this.getByUsername(login);
    }

    async getOneWithId(id) {
        return this.User.findOne({
            where: { id: id },
        });
    }
}

module.exports = UserService;
