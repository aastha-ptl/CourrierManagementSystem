import React, { useState, useEffect } from "react";
import { Table, Row, Col, Form, Spinner } from "react-bootstrap";
import Select from "react-select";
import { FaHistory, FaDownload } from "react-icons/fa";
import Footer from "../Mainpages/Footer";
import axios from "axios";

const CourierHistory = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const statusFilterOptions = [
    { value: "All", label: "All" },
    { value: "In Transit", label: "In Transit" },
    { value: "Delivered", label: "Delivered" },
  ];

  // Fetch couriers from backend
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/couriers/user-courier", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCouriers(res.data);
      } catch (err) {
        console.error("Error fetching couriers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCouriers();
  }, []);

  // Handle filter change
  const handleFilterChange = (selected) => {
    setSelectedStatus(selected.value);
  };

  // Filter couriers by status
  const filteredCouriers =
    selectedStatus === "All"
      ? couriers
      : couriers.filter((c) => c.status === selectedStatus);

  // Sort by delivered date descending
  filteredCouriers.sort(
    (a, b) =>
      new Date(b.deliveredDate).getTime() - new Date(a.deliveredDate).getTime()
  );

  // React-Select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: "#C76C3F",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
      "&:hover": { borderColor: "#C76C3F" },
      minHeight: "30px",
      height: "30px",
      fontSize: "0.9rem",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "30px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
      color: "#000",
      cursor: "pointer",
      fontSize: "0.9rem",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: "0.9rem",
    }),
    singleValue: (base) => ({
      ...base,
      lineHeight: "30px",
    }),
  };

  const sectionStyle = {
    backgroundColor: "#FDFBD8",
    minHeight: "100vh",
    padding: "40px 0",
    overflowX: "auto",
  };

  const headingStyle = {
    color: "#C76C3F",
    fontWeight: "700",
    fontSize: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  };

  const tableStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    backgroundColor: "#FDFBD8",
    overflow: "visible",
  };

  // Inject custom table header style
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-thead th {
        background-color: #C76C3F !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <div style={sectionStyle}>
        <h2
          className="text-center mb-4 d-flex align-items-center justify-content-center gap-2"
          style={headingStyle}
        >
          <FaHistory style={{ marginRight: "8px" }} />
          Courier History
        </h2>

        <Row className="mb-3" style={{ maxWidth: "300px", margin: "0 auto" }}>
          <Col>
            <Form.Label>
              <strong>Status Filter</strong>
            </Form.Label>
            <Select
              options={statusFilterOptions}
              value={statusFilterOptions.find(
                (opt) => opt.value === selectedStatus
              )}
              onChange={handleFilterChange}
              isSearchable={false}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition={"fixed"}
            />
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" style={{ color: "#C76C3F" }} />
          </div>
        ) : (
          <Table bordered responsive style={tableStyle}>
            <thead className="custom-thead">
              <tr>
                <th>Tracking ID</th>
                <th>Receiver</th>
                <th>Status</th>
                <th>Delivered Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredCouriers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No courier history found.
                  </td>
                </tr>
              ) : (
                filteredCouriers.map((courier) => (
                  <tr key={courier.trackingId}>
                    <td>{courier.trackingId}</td>
                    <td>{courier.receiver.name}</td>
                    <td>{courier.status}</td>
                    <td>
                      {courier.status === "Delivered"
                        ? (() => {
                          const date = new Date(courier.deliveryDate);
                          const day = String(date.getDate()).padStart(2, "0");
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const year = date.getFullYear();
                          return `${day}-${month}-${year}`;
                        })()
                        : "-"}

                    </td>
                    <td>
                      <a
                        className="btn"
                        style={{
                          backgroundColor: "#fff",
                          color: "#C76C3F",
                          border: "1px solid #C76C3F",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: "500",
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "14px",
                        }}
                        href={`http://localhost:5000/receipts/${courier.trackingId}.pdf`}
                        download={`${courier.trackingId}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload
                          style={{ color: "#C76C3F", marginRight: "5px" }}
                        />
                        View & Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CourierHistory;
