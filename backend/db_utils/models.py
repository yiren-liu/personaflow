def get_RQGenWeb_with_tablename(tablename):
    return {
        "tablename": tablename,
        "schema": {
            "id": "integer",
            "user": "text",
            "time_stamp": "timestamp",
            "client_name": "text",
            "session_id": "text",
            "type": "text",
            "log_body": "text"
        }
    }
