import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaFileAlt, FaFilePdf, FaFileExcel } from "react-icons/fa";
import Select from "react-select";
import axios from "axios";

// Status options for courier
const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "Booked", label: "Booked" },
  { value: "In Transit", label: "In Transit" },
  { value: "Received at Destination Branch", label: "Received at Destination Branch" },
  { value: "Out for Delivery", label: "Out for Delivery" },
  { value: "Delivered", label: "Delivered" },
  { value: "Unable to Deliver", label: "Unable to Deliver" },
  { value: "Delivered at Branch", label: "Delivered at Branch" },
];

const GenerateReport = () => {
  const [focusedField, setFocusedField] = useState("");
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    status: null,
    originBranch: null,
    destinationBranch: null,
  });

  const [branches, setBranches] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/branches/getallbranchesname", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(res.data);
        const options = res.data.map((branch) => ({
          value: branch._id,
          label: branch.branchName,
        }));
        setBranchOptions([{ value: "All", label: "All Branches" }, ...options]);
      } catch (err) {
        console.error("Error fetching branches", err);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    // End date is now optional - will default to current date if not provided
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setReportData(null);

    try {
      const token = localStorage.getItem("token");
      
      // If end date is not selected, use current date and update form state
      let endDate = formData.endDate;
      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0];
        setFormData((prev) => ({ ...prev, endDate: endDate }));
      }
      
      const params = {
        startDate: formData.startDate,
        endDate: endDate,
        status: formData.status?.value !== "All" ? formData.status?.value : undefined,
        originBranch: formData.originBranch?.value !== "All" ? formData.originBranch?.value : undefined,
        destinationBranch: formData.destinationBranch?.value !== "All" ? formData.destinationBranch?.value : undefined,
      };

      const res = await axios.get("http://localhost:5000/api/reports/generate", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setReportData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // If end date is not selected, use current date and update form state
      let endDate = formData.endDate;
      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0];
        setFormData((prev) => ({ ...prev, endDate: endDate }));
      }
      
      const params = {
        startDate: formData.startDate,
        endDate: endDate,
        status: formData.status?.value !== "All" ? formData.status?.value : undefined,
        originBranch: formData.originBranch?.value !== "All" ? formData.originBranch?.value : undefined,
        destinationBranch: formData.destinationBranch?.value !== "All" ? formData.destinationBranch?.value : undefined,
        format: "pdf",
      };

      const res = await axios.get("http://localhost:5000/api/reports/export", {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `courier_report_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error exporting PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // If end date is not selected, use current date and update form state
      let endDate = formData.endDate;
      if (!endDate) {
        endDate = new Date().toISOString().split('T')[0];
        setFormData((prev) => ({ ...prev, endDate: endDate }));
      }
      
      const params = {
        startDate: formData.startDate,
        endDate: endDate,
        status: formData.status?.value !== "All" ? formData.status?.value : undefined,
        originBranch: formData.originBranch?.value !== "All" ? formData.originBranch?.value : undefined,
        destinationBranch: formData.destinationBranch?.value !== "All" ? formData.destinationBranch?.value : undefined,
        format: "excel",
      };

      const res = await axios.get("http://localhost:5000/api/reports/export", {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `courier_report_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error exporting Excel");
    }
  };

  const getInputStyle = (fieldName) => ({
    borderColor: "#C76C3F",
    boxShadow:
      focusedField === fieldName
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
  });

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: "#C76C3F",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
      "&:hover": {
        borderColor: "#C76C3F",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
      color: "#000",
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // Add custom style for table header
  const style = document.createElement("style");
  style.innerHTML = `.custom-thead th { background-color: #C76C3F !important; color: white !important; }`;
  if (!document.querySelector('style[data-custom-thead]')) {
    style.setAttribute('data-custom-thead', 'true');
    document.head.appendChild(style);
  }

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 mt-2" style={{ color: "#C76C3F" }}>
        <FaFileAlt className="me-2" />
        Generate Report
      </h3>

      <Card className="shadow-sm border-0 mb-4" style={{ backgroundColor: "#FDFBD8" }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="startDate">
                  <Form.Label className="fw-semibold">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    style={getInputStyle("startDate")}
                    onFocus={() => setFocusedField("startDate")}
                    onBlur={() => setFocusedField("")}
                    onChange={handleChange}
                    required
                  />
                  {errors.startDate && (
                    <div className="text-danger">{errors.startDate}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="endDate">
                  <Form.Label className="fw-semibold">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    style={getInputStyle("endDate")}
                    onFocus={() => setFocusedField("endDate")}
                    onBlur={() => setFocusedField("")}
                    onChange={handleChange}
                  />
                  {errors.endDate && (
                    <div className="text-danger">{errors.endDate}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="status">
                  <Form.Label className="fw-semibold">Status (Optional)</Form.Label>
                  <Select
                    options={statusOptions}
                    value={formData.status}
                    onChange={(option) => handleSelectChange("status", option)}
                    placeholder="Select status"
                    styles={selectStyles}
                    isClearable
                    onFocus={() => setFocusedField("status")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="originBranch">
                  <Form.Label className="fw-semibold">Origin Branch (Optional)</Form.Label>
                  <Select
                    options={branchOptions}
                    value={formData.originBranch}
                    onChange={(option) => handleSelectChange("originBranch", option)}
                    placeholder="Select origin branch"
                    styles={selectStyles}
                    isClearable
                    onFocus={() => setFocusedField("originBranch")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="destinationBranch">
                  <Form.Label className="fw-semibold">
                    Destination Branch (Optional)
                  </Form.Label>
                  <Select
                    options={branchOptions}
                    value={formData.destinationBranch}
                    onChange={(option) =>
                      handleSelectChange("destinationBranch", option)
                    }
                    placeholder="Select destination branch"
                    styles={selectStyles}
                    isClearable
                    onFocus={() => setFocusedField("destinationBranch")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button
              type="submit"
              className="mt-2 px-4"
              style={{
                backgroundColor: "#C76C3F",
                color: "#fff",
                border: "none",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Report Display and Export Section */}
      {reportData && (
        <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold" style={{ color: "#C76C3F" }}>
                Report Results ({reportData.count || 0} couriers)
              </h5>
              <div>
                <Button
                  variant="danger"
                  size="sm"
                  className="me-2"
                  onClick={handleExportPDF}
                  style={{
                    backgroundColor: "#C76C3F",
                    border: "none",
                  }}
                >
                  <FaFilePdf className="me-1" />
                  Export PDF
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleExportExcel}
                  style={{
                    backgroundColor: "#28a745",
                    border: "none",
                  }}
                >
                  <FaFileExcel className="me-1" />
                  Export Excel
                </Button>
              </div>
            </div>

            {reportData.couriers && reportData.couriers.length > 0 ? (
              <div className="table-responsive">
                <Table bordered responsive>
                  <thead className="custom-thead">
                    <tr>
                      <th>Tracking ID</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Booking Date</th>
                      <th>Delivery Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.couriers.map((courier, index) => (
                      <tr key={index}>
                        <td>{courier.trackingId || "N/A"}</td>
                        <td>{courier.sender?.name || "N/A"}</td>
                        <td>{courier.receiver?.name || "N/A"}</td>
                        <td>{courier.originBranch?.branchName || "N/A"}</td>
                        <td>{courier.destinationBranch?.branchName || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${
                              courier.status === "Delivered"
                                ? "bg-success"
                                : courier.status === "In Transit"
                                ? "bg-primary"
                                : courier.status === "Unable to Deliver"
                                ? "bg-danger"
                                : courier.status === "Booked"
                                ? "bg-info"
                                : "bg-warning"
                            }`}
                          >
                            {courier.status || "N/A"}
                          </span>
                        </td>
                        <td>
                          {courier.createdAt
                            ? (() => {
                                const d = new Date(courier.createdAt);
                                const day = String(d.getDate()).padStart(2, "0");
                                const month = String(d.getMonth() + 1).padStart(2, "0");
                                const year = d.getFullYear();
                                return `${day}-${month}-${year}`;
                              })()
                            : "N/A"}
                        </td>
                        <td>
                          {courier.status === "Delivered" && courier.deliveryDate
                            ? (() => {
                                const d = new Date(courier.deliveryDate);
                                const day = String(d.getDate()).padStart(2, "0");
                                const month = String(d.getMonth() + 1).padStart(2, "0");
                                const year = d.getFullYear();
                                return `${day}-${month}-${year}`;
                              })()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-muted text-center">No couriers found for the selected criteria.</p>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default GenerateReport;
