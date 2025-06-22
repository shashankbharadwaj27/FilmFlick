import JWT from 'jsonwebtoken';

function decodeToken(token){
    const decoded = JWT.verify(token,'iamironman');
    return decoded.username;
}

export default decodeToken