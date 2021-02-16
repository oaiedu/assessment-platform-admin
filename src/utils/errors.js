const models = {
    load(category, message) {
        return 'Error ao carregar ' + category + ': ' + message;
    },
    creation(category, message) {
        return 'Erro ao criar ' + category + ': ' + message;
    },
    edition(category, message) {
        return 'Erro ao editar ' + category + ': ' + message;
    },
    exclusion(category, message) {
        return 'Erro ao excluir ' + category + ': ' + message;
    },
    notFound(message) {
        return 'Item "' + message + '" não encontrado!';
    },
    connection(message) {
        return 'Erro de conexão: ' + message;
    },
    admin(message) {
        return 'Erro: ' + message + '\nEntre em contato com algum administrador.';
    },
    default(message) {
        return 'Erro: ' + message;
    }
}

export const showErrorMessage = (type, category, message) => {
    if(type == 'notFound'
        || type == 'connection'
        || type == 'admin'
        || type == 'default') return models[type](message);
    return models[type](category, message);
}
