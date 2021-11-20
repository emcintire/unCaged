const changeResolution = (res, movie) => {
    const imgStr = movie.img.split('');
    imgStr[movie.img.length - 5] = res;
    movie.img = imgStr.join('');

    return movie;
};

const changeProfilePicRes = (res, imgStr) => {
    const str = imgStr.split('');
    str[imgStr.length - 5] = res;
    imgStr = str.join('');

    return imgStr;
};

exports.changeResolution = changeResolution;
exports.changeProfilePicRes = changeProfilePicRes;
