from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data if isinstance(response.data, dict) else {'detail': response.data}
        
        # Build a helpful human-readable message from the first field error
        message = 'An error occurred while processing your request.'
        if isinstance(response.data, dict):
            if 'detail' in response.data and isinstance(response.data['detail'], str):
                message = response.data['detail']
            else:
                for key, val in response.data.items():
                    field_name = key.replace('_', ' ').capitalize()
                    if isinstance(val, list) and len(val) > 0:
                        message = f"{field_name}: {val[0]}"
                        break
                    elif isinstance(val, str):
                        message = f"{field_name}: {val}"
                        break
        elif isinstance(response.data, list) and len(response.data) > 0:
            message = str(response.data[0])

        custom_data = {
            'success': False,
            'status_code': response.status_code,
            'errors': errors,
            'message': message
        }

        response.data = custom_data

    else:
        # Unhandled exception (database error, missing table, etc.)
        import logging
        logger = logging.getLogger('django')
        logger.error(f"Unhandled server error: {exc}", exc_info=True)

        err_msg = str(exc)
        if 'no such table' in err_msg.lower() or 'does not exist' in err_msg.lower():
            friendly = f"Database tables need migration: {err_msg}. Please run python manage.py migrate."
        else:
            friendly = f"Server Error: {err_msg}"

        return Response({
            'success': False,
            'status_code': 500,
            'errors': {'server': [err_msg]},
            'message': friendly
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
