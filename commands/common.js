const determinePlatform = function(inputPlatform) {
    if (['bnet', 'battle.net', 'battle'].includes(inputPlatform)) {
        return 'battlenet';
    } else if (['psn', 'playstation', 'ps4'].includes(inputPlatform)) {
        return 'psn';
    } else if (['xbl', 'xbox'].includes(inputPlatform)) {
        return 'xbl';
    } else if (['cod', 'activision', 'acti', 'atvi'].includes(inputPlatform)) {
        return 'atvi';
    }
};

exports.determinePlatform = determinePlatform;
