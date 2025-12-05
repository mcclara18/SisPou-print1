class SanitizationMiddleware {
    static sanitizeInput(data) {
        if (typeof data === 'string') {
            return data.trim()
                .replace(/[<>]/g, '')
                .replace(/['";]/g, '');
        }
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    sanitized[key] = this.sanitizeInput(data[key]);
                }
            }
            return sanitized;
        }
        return data;
    }

    static sanitize(req, res, next) {
        if (req.body) {
            req.body = this.sanitizeInput(req.body);
        }
        if (req.query) {
            req.query = this.sanitizeInput(req.query);
        }
        if (req.params) {
            req.params = this.sanitizeInput(req.params);
        }
        next();
    }
}

module.exports = SanitizationMiddleware;
