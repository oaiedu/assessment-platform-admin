const requireModule = require.context('.', false, /\.store\.js$/);
const modules = {};

requireModule.keys().forEach(fileName => {
    const moduleName = fileName
                    .replace(/(\.\/|\.store\.js)/g, '')
                    .replace(/^\w/, c => c.toUpperCase())

    modules[moduleName] = requireModule(fileName).default || requireModule(fileName);
});

export default modules;
