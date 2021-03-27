// This function is to avoid wrapping every async function in 'try{} catch() {}' blocks
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
