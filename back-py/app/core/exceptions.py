class DomainError(Exception):
    code: str = "DOMAIN_ERROR"

    def __init__(self, message: str = "Error de dominio", details: dict | list | None = None):
        self.message = message
        self.details = details
        super().__init__(message)


class NotFoundError(DomainError):
    code: str = "NOT_FOUND"

    def __init__(self, message: str = "Recurso no encontrado", details: dict | list | None = None):
        super().__init__(message, details)


class ConflictError(DomainError):
    code: str = "CONFLICT"

    def __init__(self, message: str = "Conflicto", details: dict | list | None = None):
        super().__init__(message, details)


class InsufficientStockError(DomainError):
    code: str = "INSUFFICIENT_STOCK"

    def __init__(self, message: str = "Stock insuficiente", details: dict | list | None = None):
        super().__init__(message, details)


class AuthenticationError(DomainError):
    code: str = "AUTHENTICATION_ERROR"

    def __init__(self, message: str = "Credenciales inválidas", details: dict | list | None = None):
        super().__init__(message, details)


class AuthorizationError(DomainError):
    code: str = "AUTHORIZATION_ERROR"

    def __init__(self, message: str = "No autorizado", details: dict | list | None = None):
        super().__init__(message, details)
