import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Spinner, Form, InputGroup } from "react-bootstrap";
import { PeopleFill, Search } from "react-bootstrap-icons";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

const ViewStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/staff-by-branch", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      alert("Failed to fetch staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ✅ Toggle active/inactive
  const handleDeactivate = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/auth/${userId}/status`,
        { isActive: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchStaff(); // Refresh list after update
    } catch (err) {
      console.error("Failed to update user status", err);
      alert("Failed to update status");
    }
  };

  // ✅ Custom table header style
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

  // Filter staff based on search term
  const filteredStaff = staffList.filter((staff) => {
    const search = searchTerm.toLowerCase();
    return (
      staff.name?.toLowerCase().includes(search) ||
      staff.email?.toLowerCase().includes(search) ||
      staff.phone?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container">
      <h3 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <PeopleFill size={24} className="me-2 text-secondary" />
        Branch Staff
      </h3>

      {/* Search Bar */}
      <div className="mb-3">
        <InputGroup style={{ maxWidth: "400px" }}>
          <InputGroup.Text style={{ backgroundColor: "transparent", border: "1px solid #C76C3F", borderRight: "none" }}>
            <Search style={{ color: "#C76C3F" }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderLeft: "none", borderColor: "#C76C3F", boxShadow: "none" }}
          />
        </InputGroup>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table bordered responsive>
          <thead className="custom-thead">
            <tr>
              <th>Sr No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th> {/* ✅ Added */}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  {searchTerm ? "No staff found matching your search." : "No staff found."}
                </td>
              </tr>
            ) : (
              filteredStaff.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "N/A"}</td>
                  <td>
                    <Button
                      size="sm"
                      className="me-2"
                      style={{
                        backgroundColor: user.isActive ? "#dc3545" : "#28a745",
                        border: "none",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                      onClick={() => handleDeactivate(user._id, !user.isActive)}
                    >
                      {user.isActive ? (
                        <>
                          <FaToggleOn /> Deactivate
                        </>
                      ) : (
                        <>
                          <FaToggleOff /> Activate
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ViewStaff;
