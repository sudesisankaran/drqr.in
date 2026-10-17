import requests
import uuid

BASE_URL = "http://127.0.0.1:8000"

def test_hospital_patient_qr_flow():
    print("=== TESTING HOSPITAL-BASED PATIENT REGISTRATION WITH ONE PERMANENT QR ===")

    # 1. Login as existing hospital
    hosp_login = requests.post(f"{BASE_URL}/api/auth/login/", json={
        "email": "apollo@hospital.com",
        "password": "Password123!"
    })
    assert hosp_login.status_code == 200, f"Hospital login failed: {hosp_login.text}"
    hosp_token = hosp_login.json()["tokens"]["access"]
    hosp_headers = {"Authorization": f"Bearer {hosp_token}"}
    print("[1] Hospital logged in successfully.")

    # 2. Register New Patient from Hospital Dashboard
    suffix = uuid.uuid4().hex[:6]
    phone = f"9876{suffix[:6]}"
    patient_payload = {
        "full_name": f"Kavitha Ramanathan {suffix}",
        "phone": phone,
        "email": f"kavitha_{suffix}@healthcare.org",
        "date_of_birth": "1992-06-15",
        "gender": "female",
        "address": "12 Gandhi Road",
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600004",
        "emergency_contact": "9876540000",
        "initial_visit_date": "2026-10-15",
        "consent_acknowledged": True
    }
    reg_res = requests.post(f"{BASE_URL}/api/hospital/patients/", json=patient_payload, headers=hosp_headers)
    assert reg_res.status_code == 201, f"Patient reg failed ({reg_res.status_code}): {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    assert reg_data["is_new_patient"] is True

    pat_id = reg_data["patient"]["id"]
    ref_id = reg_data["patient"]["patient_reference_id"]
    qr_uuid = reg_data["qr_identity"]["public_uuid"]
    print(f"[2] Patient registered by hospital! Ref ID: {ref_id}, QR UUID: {qr_uuid}")

    # 3. Verify exactly ONE QR identity: Try re-registering or linking the same patient phone
    link_res = requests.post(f"{BASE_URL}/api/hospital/patients/", json=patient_payload, headers=hosp_headers)
    assert link_res.status_code == 201
    link_data = link_res.json()
    assert link_data["is_new_patient"] is False
    assert link_data["patient"]["id"] == pat_id
    assert link_data["qr_identity"]["public_uuid"] == qr_uuid, "CRITICAL ERROR: Duplicate QR created!"
    print(f"[3] Re-registration verified: Kept identical permanent QR UUID: {qr_uuid}")

    # 4. List patients on hospital dashboard
    list_res = requests.get(f"{BASE_URL}/api/hospital/patients/?search={ref_id}", headers=hosp_headers)
    assert list_res.status_code == 200
    pats = list_res.json()["patients"]
    assert len(pats) == 1
    assert pats[0]["patient_reference_id"] == ref_id
    print(f"[4] Patient list verified: Found {len(pats)} matching patient with search={ref_id}")

    # 5. Get patient detail
    detail_res = requests.get(f"{BASE_URL}/api/hospital/patients/{pat_id}/", headers=hosp_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["qr_identity"]["public_uuid"] == qr_uuid
    print("[5] Hospital patient detail verified.")

    # 6. Stream permanent QR image
    qr_img_res = requests.get(f"{BASE_URL}/api/hospital/patients/{pat_id}/qr/?download=1", headers=hosp_headers)
    assert qr_img_res.status_code == 200
    assert qr_img_res.headers.get("Content-Type") == "image/png"
    assert len(qr_img_res.content) > 100
    print(f"[6] Permanent QR PNG image verified: {len(qr_img_res.content)} bytes received.")

    # 7. Add Clinical Visit Record from Hospital
    rec_payload = {
        "title": "Cardiology Consultation & ECG Review",
        "record_type": "Outpatient Consultation",
        "record_date": "2026-10-17",
        "description": "Patient reports mild chest tightness on exertion. BP 120/80. ECG normal sinus rhythm.",
        "doctor_in_charge": "Dr. K. Srinivasan",
        "specialization": "Cardiology",
        "additional_notes": "Prescribed Aspirin 75mg daily. Review in 3 weeks."
    }
    rec_res = requests.post(f"{BASE_URL}/api/hospital/patients/{pat_id}/records/", json=rec_payload, headers=hosp_headers)
    assert rec_res.status_code == 201, f"Add record failed: {rec_res.text}"
    print("[7] Clinical visit record added by hospital.")

    # 8. Generate and Download Patient Clinical Summary PDF with Embedded QR
    pdf_res = requests.get(f"{BASE_URL}/api/hospital/patients/{pat_id}/pdf/", headers=hosp_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers.get("Content-Type") == "application/pdf"
    assert len(pdf_res.content) > 1000
    print(f"[8] ReportLab Clinical Summary PDF generated and downloaded: {len(pdf_res.content)} bytes.")

    # 9. Verify Public QR Scanning (Unauthenticated)
    pub_res = requests.get(f"{BASE_URL}/api/qr/{qr_uuid}/")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["is_valid"] is True
    assert pub_data["is_authorized"] is False
    assert pub_data["patient_reference_id"] == ref_id
    assert pub_data["masked_name"].startswith("K***")
    print(f"[9] Public QR scan verified: Privacy preserved! Masked name: {pub_data['masked_name']}")

    # 10. Verify Authorized QR Scanning (Hospital with active affiliation)
    auth_qr_res = requests.get(f"{BASE_URL}/api/qr/{qr_uuid}/", headers=hosp_headers)
    assert auth_qr_res.status_code == 200
    auth_qr_data = auth_qr_res.json()
    assert auth_qr_data["is_authorized"] is True
    assert len(auth_qr_data["records"]) >= 1
    print("[10] Authorized QR scan verified: Records and clinical data unlocked!")

    print("\n==========================================================================")
    print("ALL 10 HOSPITAL PATIENT REGISTRATION & PERMANENT QR TESTS PASSED (100%)!")
    print("==========================================================================\n")

if __name__ == "__main__":
    test_hospital_patient_qr_flow()
