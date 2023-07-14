const {
  DocName,
  initialRolesDoc,
} = require('../constants/docs');
const DbController = require('./base/db-controller');
const RolesMember = require('../models/roles-member');

class RolesController extends DbController {
  constructor() {
    super(DocName.Roles, initialRolesDoc);
    this.init();
  }

  configInit(doc) {
    this.members = doc.members || {};
  }

  async saveMember(memberId) {
    const member = this.members[memberId];

    return this.db.upsert(this.docName, (doc) => {
      doc.members[member] = member.toJsonCompatibleObject();
      return doc;
    });
  }

  async getMember(memberId) {
    if (!this.members[memberId]) {
      this.members[memberId] = new RolesMember({ id: memberId });
      await this.saveMember(memberId);
    }

    return this.members[memberId];
  }
}

module.exports = new RolesController();
