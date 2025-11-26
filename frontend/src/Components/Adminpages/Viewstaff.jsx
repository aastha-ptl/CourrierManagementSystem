import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import { FaUsersCog, FaUserAlt, FaEnvelope, FaMapMarkerAlt, FaUserShield, FaEye, FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";
import axios from "axios";

const ViewStaff = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState({ value: "All", label: "All" });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const roles = ["All", "staff", "branchadmin"];
  const [selectedRole, setSelectedRole] = useState("All");

  const fetchBranches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/branches/getallbranchesname", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      const branchOptions = [
        { value: "All", label: "All" },
        ...data.map((b) => ({
          value: b._id,
          label: b.branchName,
        })),
      ];
      setBranches(branchOptions);
      setSelectedBranch(branchOptions[0]);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchStaffUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBranch.value !== "All") {
        params.branch = selectedBranch.value;
      }

      const res = await axios.get("http://localhost:5000/api/auth/staffandbranchadmins", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching staff users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchStaffUsers();
  }, [selectedBranch]);

  const filterSummary = () => {
    return selectedBranch.value === "All"
      ? "Showing all staff and branch admins"
      : `Filtered by Branch: ${selectedBranch.label}`;
  };

  const handleCloseModal = () => setShowModal(false);
  const handleRemove = (userId) => console.log("Remove user ID:", userId);
  const handleDeactivate = async (userId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/auth/${userId}/status`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update UI without refreshing
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: newStatus } : u
        )
      );

    } catch (err) {
      console.error("Error updating status:", err);
    }
  };


  React.useEffect(() => {
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
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: "#C76C3F",
      boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)" : "none",
      "&:hover": { borderColor: "#C76C3F" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
      color: "#000",
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  // Filtered users by name
  const filteredUsers = users.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    return matchesName && matchesRole;
  });

  return (
    <div className="container">
      <h3 className="fw-bold mb-3 mt-2 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <FaUsersCog size={30} className="me-2 text-secondary" />
        Staff & Branch Admins
      </h3>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Label><strong>Filter by Role</strong></Form.Label>
          <Select
            options={roles.map(role => ({
              value: role,
              label: role === "user" ? "Customer" : role.charAt(0).toUpperCase() + role.slice(1)
            }))}
            value={{
              value: selectedRole,
              label: selectedRole === "user" ? "Customer" : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
            }}
            onChange={(selected) => setSelectedRole(selected.value)}
            placeholder="Select Role"
            styles={selectStyles}
          />
        </Col>

        <Col xs={12} md={4}>
          <Form.Label><strong>Filter by Branch</strong></Form.Label>
          <Select
            options={branches}
            value={selectedBranch}
            onChange={setSelectedBranch}
            isSearchable
            placeholder="Select branch"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: "#C76C3F",
                boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)" : "none",
                "&:hover": { borderColor: "#C76C3F" },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
                color: "#000",
              }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </Col>

        <Col xs={12} md={4} className="mt-2 mt-md-0">
          <Form.Label><strong>Search by Name</strong></Form.Label>
          <div style={{ position: "relative" }}>

            <Form.Control
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                paddingLeft: "35px",
                borderColor: "#C76C3F",
                boxShadow: isFocused ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)" : "none"
              }}
            />

            <FaSearch style={{ position: "absolute", top: "50%", left: "10px", transform: "translateY(-50%)", color: "#C76C3F" }} />
          </div>
        </Col>
      </Row>

      <p className="mb-2 fst-italic" style={{ color: "#555" }}>{filterSummary()}</p>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table bordered responsive>
          <thead className="custom-thead">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No staff found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.branch?.branchName || "—"}</td>
                  <td>{user.role === "branchadmin" ? "Branch Admin" : "Staff"}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      style={{
                        backgroundColor: "#C76C3F",
                        border: "none",
                        color: "#FDFBD8",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      <FaEye /> View
                    </Button>

                    <Button
                      size="sm"
                      className="me-2"
                      style={{
                        backgroundColor: user.isActive ? "#dc3545" : "#28a745", // red if active, green if inactive
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
                          <FaToggleOff /> {/* Show OFF icon because clicking will turn it off */}
                          Deactivate
                        </>
                      ) : (
                        <>
                          <FaToggleOn /> {/* Show ON icon because clicking will turn it on */}
                          Activate
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

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div
          style={{
            backgroundColor: "#FDFBD8",
            borderRadius: "10px",
            padding: "20px",
            width: "100%",
          }}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
              <FaUserAlt className="me-2" /> User Details
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ lineHeight: "1.8", color: "#333" }}>
            {selectedUser && (
              <>
                <p><strong><FaUserAlt className="me-2" />Name:</strong> {selectedUser.name}</p>
                <p><strong><FaEnvelope className="me-2" />Email:</strong> {selectedUser.email}</p>
                <p><strong><FaMapMarkerAlt className="me-2" />Branch:</strong> {selectedUser.branch?.branchName || "—"}</p>
                <p><strong><FaUserShield className="me-2" />Role:</strong> {selectedUser.role === "branchadmin" ? "Branch Admin" : "Staff"}</p>
              </>
            )}
          </Modal.Body>

          <div className="text-end mt-3">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              style={{
                backgroundColor: "#C76C3F",
                color: "#FDFBD8",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewStaff;
