import requests

BASE_URL = 'http://127.0.0.1:8000'

def test_query_token_auth():
    # 1. Login as patient
    login_res = requests.post(
        f'{BASE_URL}/api/auth/login/',
        json={'email': 'john@patient.com', 'password': 'Password123!'}
    )
    assert login_res.status_code == 200, f'Login failed: {login_res.text}'
    token = login_res.json()['tokens']['access']

    # 2. Get records list with header
    records_res = requests.get(
        f'{BASE_URL}/api/medical-records/',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert records_res.status_code == 200, f'List failed: {records_res.text}'
    results = records_res.json()
    if isinstance(results, dict) and 'results' in results:
        results = results['results']

    print(f'Total records found for john@patient.com: {len(results)}')
    
    if not results:
        # Upload a quick doc to test
        # Get patient hospitals
        h_res = requests.get(f'{BASE_URL}/api/patient-hospitals/', headers={'Authorization': f'Bearer {token}'})
        hospitals = h_res.json().get('results', h_res.json())
        if isinstance(hospitals, dict) and 'results' in hospitals:
            hospitals = hospitals['results']
        hosp_id = hospitals[0]['id']
        
        with open('scratch_test_report.pdf', 'rb') as f:
            upload_res = requests.post(
                f'{BASE_URL}/api/medical-records/',
                files={'file': ('test.pdf', f, 'application/pdf')},
                data={'hospital_record': hosp_id, 'title': 'Test Report', 'category': 'Lab Report'},
                headers={'Authorization': f'Bearer {token}'}
            )
            doc_id = upload_res.json()['data']['id']
    else:
        doc_id = results[0]['id']

    print(f'Testing Document ID: {doc_id}')

    # 3. Simulate browser opening the URL in a new tab:
    # Notice: NO 'Authorization' HTTP header is sent! Only ?download=0&token=...
    browser_url = f'{BASE_URL}/api/medical-records/{doc_id}/download/?download=0&token={token}'
    print(f'Browser URL: {browser_url[:80]}...')
    
    res = requests.get(browser_url)
    print(f'HTTP Status Code: {res.status_code}')
    print(f'Content-Type: {res.headers.get("Content-Type")}')
    print(f'Content-Disposition: {res.headers.get("Content-Disposition")}')
    print(f'Streamed file size: {len(res.content)} bytes')

    assert res.status_code == 200, f'Failed with status {res.status_code}: {res.text}'
    print('\n>>> VERIFIED: Direct URL access with ?token= parameter authenticated successfully with 200 OK! <<<')

if __name__ == '__main__':
    test_query_token_auth()
