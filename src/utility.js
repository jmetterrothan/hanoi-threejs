const TWO_PI = Math.PI * 2;

const degToRad = (deg) => {
    return deg * Math.PI / 180;
};

const radToDeg = (rad) => {
    return rad * 180 / Math.PI;
};

const lerp = (a, b, t) => {
    return (1 - t) * a + t * b;
};

export default {
    TWO_PI,
    degToRad,
    radToDeg,
    lerp,
};