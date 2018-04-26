import {
    User
} from '/imports/api/users/users.js';
import './user_profile.html';
import '../verify/verify.html';
import '../verify/verify.js';

Template.user_profile.onCreated(function () {
    if (this.data.userId) {
        this.userId = this.data.userId;
    } else if (FlowRouter.getParam('userId')) {
        this.userId = FlowRouter.getParam('userId');
    } else {
        this.userId = Meteor.userId();
    }
    this.autorun(() => {
        this.subscription = this.subscribe('userData', {
            onStop: function () {
                console.log("User profile subscription stopped! ", arguments, this);
            },
            onReady: function () {
                console.log("User profile subscription ready! ", arguments, this);
            }
        });
        this.subscription2 = this.subscribe('userList', this.userId, {
            onStop: function () {
                console.log("User List subscription stopped! ", arguments, this);
            },
            onReady: function () {
                console.log("User List subscription ready! ", arguments, this);
            }
        });
        console.log(this.subscription2);
    });
});
Template.user_profile.onRendered(function () {
    Meteor.setTimeout(function () {
        $("#input-bdate").datetimepicker({
            useCurrent: false,
            showClear: true,
            showClose: true,
            format: 'YYYY-MM-DD'
        });
    }, 1000);
    let updateEmailVisibility = function() {
        let m;
        m = $(elem).css('background-color').replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        let btnChange = $(elem).parents('div.change-email-div').find('button.btn-email-change');
        let emailInput = $(elem).parents('div.change-email-div').find('input.input-new-email');
        let emailBtnGroupDiv = $(elem).parents('div.change-email-div').find('div.btn-email-group');
        emailInput.css('visibility', 'visible'); emailInput.css('display', 'unset');
        emailBtnGroupDiv.css('visibility', 'visible'); emailBtnGroupDiv.css('display', 'unset');
    }
});

Template.user_profile.helpers({
    userId() {
        return Template.instance().userId;
    },
    userField(fldName) {
        let uid = Template.instance().userId;
        let u = User.findOne({
            _id: uid
        });
        if (u) {
            switch (fldName) {
                case 'firstName':
                    return u.MyProfile.firstName;
                    break;
                case 'lastName':
                    return u.MyProfile.lastName;
                    break;
                case 'fullName':
                    return u.MyProfile.fullName();
                    break;
                case 'gender':
                    return (u.MyProfile.gender ? 'female' : 'male');
                    break;
                case 'birthDate':
                    let d = u.MyProfile.birthDate;
                    let dateText = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
                    return dateText;
                    break;
                case 'dashboardPanes':
                    return (u.MyProfile.dashboardPanes.length > 0 ? 'Custom' : 'Default');
                    break;
            }
            return u.MyProfile.fullName();
        } else {
            return "";
        }
    },
    genderSelected(label) {
        let uid = Template.instance().userId;
        let u = User.findOne({
            _id: uid
        });
        if (!u) return "";
        if (
            ("f" === label.slice(0, 1) || "F" === label.slice(0, 1)) &&
            u.MyProfile.gender === true
        ) {
            return "selected";
        }
        if (
            ("m" === label.slice(0, 1) || "M" === label.slice(0, 1)) &&
            u.MyProfile.gender === false
        ) {
            return "selected";
        }
        return "";
    },
    userName() {
        let uid = Template.instance().userId;
        let u = User.findOne({
            _id: uid
        });
        if (u) {
            return u.MyProfile.fullName();
        } else {
            return "";
        }
    },
    emailAddress() {
        let uid = Template.instance().userId;
        let u = User.findOne({
            _id: uid
        });
        if (u) {
            emailAddresses = [];
            for (let i = 0; i < u.emails.length; i++) {
                emailAddresses.push(u.emails[i].address);
            }
            return emailAddresses.join(',');
        } else {
            return "";
        }
    },
    
});


Template.user_profile.events({
    'change input.flat,textarea.flat,select' (event, instance) {
        $(event.target).addClass('changed');
        $("#btn-group").fadeIn();
    },
    'dp.change' (event, instance) {
        $(event.target).addClass('changed');
        $("#btn-group").fadeIn();
    },
    'keyup input,textarea' (event, instance) {
        let $t = $(event.target);
        $t.addClass('changed');
        $("#btn-group").fadeIn();
    },
    'click button.btn-save' (event, instance) {
        let $t = $(event.target);
        $t.closest(".container").find(".changed").removeClass("changed");
        //todo: update database
        let uprofile = {
            firstName: $("#input-fname").val(),
            lastName: $("#input-lname").val(),
            gender: (true == $("#input-gender").val()),
            birthDate: $("#input-bdate").val()
        };
        let uid = Template.instance().userId;
        let u = User.findOne({
            _id: uid
        });
        if (u) {
            u.profileUpdate(uprofile);
        }
    },
    'click button.btn-cancel' (event, instance) {
        let $t = $(event.target);
        $t.closest(".container").find(".changed").removeClass("changed");
        $("#frm-profile")[0].reset();
    },
    'click button.btn-email-change' (event, instance) {
        updateEmailVisibility();
        let $t = $(event.target);
        $t.addClass('changed');
        $("#btn-email-group").fadeIn();

    },
    'click button.email-save' (event, instance) {
        let $t = $(event.target);
        $t.closest(".container").find(".changed").removeClass("changed");
        //todo: update database
        let uid = Template.instance().userId;
        let u = User.findOne({
            _id: uid
        });
        if (u) {
            u.profileUpdate(uprofile.emailAddress());
        }
    },
    'click button.cancel-email' (event, instance) {
        let $t = $(event.target);
        $t.closest(".container").find(".changed").removeClass("changed");
        $("#frm-profile")[0].reset();
    }
});