from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class QueryParamOrHeaderJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's JWTAuthentication to support both:
    1. 'Authorization: Bearer <token>' HTTP header (for standard Axios/REST API requests)
    2. '?token=<token>' query parameter (for direct browser file views, new tab previews, PDFs, and downloads)
    """

    def authenticate(self, request):
        # 1. Try standard header authentication first
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token

        # 2. Check query parameter 'token' if no header is present
        raw_token = request.query_params.get('token')
        if raw_token:
            if isinstance(raw_token, str):
                raw_token = raw_token.strip().encode('utf-8')
            try:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, AuthenticationFailed):
                # If an invalid query token is provided, raise AuthenticationFailed
                # so the client gets an appropriate 401 error
                raise

        return None
