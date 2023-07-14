class RolesMember {
  constructor({ id, allowedRoles }) {
    this.id = id;
    this.allowedRoles = new Set(allowedRoles);
  }

  toJsonCompatibleObject() {
    return {
      id: this.id,
      allowedRoles: Array.from(this.allowedRoles),
    };
  }
}

module.exports = RolesMember;
