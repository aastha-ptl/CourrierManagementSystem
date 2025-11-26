import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaUser, FaEnvelope, FaMapMarkerAlt, FaTruck, FaBoxOpen,
  FaCalendarAlt, FaHashtag, FaRupeeSign, FaPrint
} from "react-icons/fa";
import { FaRoute, FaWeightHanging,FaDownload } from "react-icons/fa";
import { MdPhoneAndroid } from "react-icons/md";
import "../../css/Receipt.css";

const CourierReceipt = ({ courier }) => {
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowReceipt(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!courier) return null; // Safeguard

  return (
    <div className="container">
      <div className="printer-slot">
        <div className="receipt-tear-line"></div>
      </div>

      {showReceipt && (
        <div className="card receipt-animated shadow-sm border-0 rounded-4 p-4 mx-auto" style={{ maxWidth: "720px", backgroundColor: "#FDFBD8" }}>
          <div className="text-center">
            <h2 className="fw-bold mb-0" style={{ color: "#C76C3F" }}>
              <FaBoxOpen className="me-2 icon-gray" />DAKIYAPRO
            </h2>
            <p className="text-muted mb-2">Courier Receipt</p>
            <hr />
          </div>

          {/* Courier Details */}
          <div className="mb-3">
            <h5 className="text-decoration-underline" style={{ color: "#C76C3F" }}>
              <FaTruck className="me-2 icon-gray" />Courier Details
            </h5>
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1"><FaHashtag className="me-2 icon-gray" /><strong>Tracking ID:</strong> {courier.trackingId}</p>
                <p className="mb-1"><FaCalendarAlt className="me-2 icon-gray" /><strong>Date:</strong> {courier.date}</p>
                <p className="mb-1"><FaTruck className="me-2 icon-gray" /><strong>Status:</strong> <span className="badge bg-warning text-dark">{courier.status}</span></p>
                <p className="mb-1"><FaWeightHanging className="me-2 icon-gray" /><strong>Weight:</strong> {courier.weight}</p>
              </div>
              <div className="col-md-6">
                <p className="mb-1"><FaMapMarkerAlt className="me-2 icon-gray" /><strong>From Branch:</strong> {courier.fromBranch}</p>
                <p className="mb-1"><FaMapMarkerAlt className="me-2 icon-gray" /><strong>To Branch:</strong> {courier.toBranch}</p>
                <p className="mb-1"><FaRoute className="me-2 icon-gray" /><strong>Distance:</strong> {courier.distance}</p>
                <p className="mb-1"><FaRupeeSign className="me-2 icon-gray" /><strong>Price:</strong> {courier.price}</p>
              </div>
            </div>
          </div>

          <hr />

          {/* Sender Info */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <h5 className="text-decoration-underline" style={{ color: "#C76C3F" }}>
                <FaUser className="me-2 icon-gray" />Sender Info
              </h5>
              <p className="mb-1"><strong>Name:</strong> {courier.sender.name}</p>
              <p className="mb-1"><FaEnvelope className="me-2 icon-gray" />{courier.sender.email}</p>
              <p className="mb-1"><MdPhoneAndroid className="me-2 icon-gray" />{courier.sender.phone}</p>
              <p className="mb-0"><FaMapMarkerAlt className="me-2 icon-gray" />{courier.sender.address}</p>
            </div>

            {/* Receiver Info */}
            <div className="col-md-6 mb-3">
              <h5 className="text-decoration-underline" style={{ color: "#C76C3F" }}>
                <FaUser className="me-2 icon-gray" />Receiver Info
              </h5>
              <p className="mb-1"><strong>Name:</strong> {courier.receiver.name}</p>
              <p className="mb-1"><FaEnvelope className="me-2 icon-gray" />{courier.receiver.email}</p>
              <p className="mb-1"><MdPhoneAndroid className="me-2 icon-gray" />{courier.receiver.phone}</p>
              <p className="mb-0"><FaMapMarkerAlt className="me-2 icon-gray" />{courier.receiver.address}</p>
            </div>
          </div>

          <hr />

          <div className="text-center mt-4">
            <p className="mb-1"><strong>Estimated Delivery:</strong> {courier.deliveryEstimate}</p>
            <p className="text-muted mb-0">Thank you for choosing <strong>DakiyaPro</strong>!</p>
          </div>

          <div className="text-end mt-3">
            <div className="text-end mt-3">
              <a
                className="btn"
                style={{
                  backgroundColor: "#C76C3F",
                  color: "#FDFBD8",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                href={`http://localhost:5000/receipts/${courier.trackingId}.pdf`}
                download={`${courier.trackingId}.pdf`}
              >
                <FaDownload className="me-2" style={{ color: "#FDFBD8" }} />
                View & Download Receipt
              </a>
            </div>


          </div>

        </div>
      )
      }
    </div >
  );
};

export default CourierReceipt;
