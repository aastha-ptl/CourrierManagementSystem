import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col, Modal, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaEye,
  FaUserAlt,
  FaEnvelope,
  FaUserShield,
  FaMapMarkerAlt,
  FaSearch,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";
import Select from "react-select";

const ViewUsers = () => {
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [users, setUsers] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const roles = ["All", "user", "staff", "branchadmin"];

  const fetchBranches = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/branches/getallbranchesname",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = Array.isArray(res.data) ? res.data : [];
      const branchOptions = [
        { value: "All", label: "All" },
        ...data.map((b) => ({
          value: b._id,
          label: b.branchName,
        })),
      ];

      setAllBranches(branchOptions);
      setSelectedBranch(branchOptions[0]);
    } catch (err) {
      console.error("Failed to fetch branches", err);
      const fallback = { value: "All", label: "All" };
      setAllBranches([fallback]);
      setSelectedBranch(fallback);
    }
  };

  const fetchUsers = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const params = {};

      if (selectedRole !== "All") {
        params.role = selectedRole;
      }

      if (selectedBranch.value !== "All") {
        params.branch = selectedBranch.value;
      }

      const res = await axios.get("http://localhost:5000/api/auth/allusers", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedBranch]);

  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

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

      fetchUsers();
    } catch (err) {
      console.error("Failed to update user status", err);
    }
  };

  const filterSummary = () => {
    let filters = [];
    if (selectedRole !== "All") filters.push(`Role: ${selectedRole}`);
    if (selectedBranch?.value !== "All")
      filters.push(`Branch: ${selectedBranch?.label}`);
    return filters.length
      ? `Filtered by ${filters.join(" and ")}`
      : "Showing all users";
  };

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

  // 🔍 Filter users by search term (case-insensitive)
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h3
        className="fw-bold mb-3 mt-2 d-flex align-items-center"
        style={{ color: "#C76C3F" }}
      >
        <FaUsers size={30} className="me-2 text-secondary" />
        All Users
      </h3>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>
            <strong>Search by Name</strong>
          </Form.Label>
          <div style={{ position: "relative" }}>
            <FaSearch
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                color: "#C76C3F",
              }}
            />
            <Form.Control
              type="text"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: "35px",
                borderColor: "#C76C3F",
                boxShadow: "none",
              }}
            />
          </div>
        </Col>

        <Col md={4}>
          <Form.Label>
            <strong>Filter by Role</strong>
          </Form.Label>
          <Select
            options={roles.map((role) => ({
              value: role,
              label:
                role === "user"
                  ? "Customer"
                  : role.charAt(0).toUpperCase() + role.slice(1),
            }))}
            value={{
              value: selectedRole,
              label:
                selectedRole === "user"
                  ? "Customer"
                  : selectedRole.charAt(0).toUpperCase() +
                  selectedRole.slice(1),
            }}
            onChange={(selected) => setSelectedRole(selected.value)}
            placeholder="Select Role"
            styles={selectStyles}
          />
        </Col>

        <Col md={4}>
          <Form.Label>
            <strong>Filter by Branch</strong>
          </Form.Label>
          <Select
            options={allBranches}
            value={selectedBranch}
            onChange={setSelectedBranch}
            placeholder="Select Branch"
            isSearchable
            styles={selectStyles}
          />
        </Col>
      </Row>

      <p>
        <em>{filterSummary()}</em>
      </p>

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
              <th>Role</th>
              <th>Branch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role === "user" ? "Customer" : user.role}</td>
                  <td>{user.branch?.branchName || "—"}</td>
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
                      onClick={() => handleView(user)}
                    >
                      <FaEye /> View
                    </Button>

                    <Button
                      size="sm"
                      className="me-2"
                      style={{
                        backgroundColor: user.isActive ? "#dc3545" : "#28a745", // Red for deactivate, green for activate
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#FDFBD8",
            borderBottom: "none",
          }}
        >
          <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
            <FaUserAlt className="me-2" /> User Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{ lineHeight: "1.8", color: "#333", backgroundColor: "#FDFBD8" }}
        >
          {selectedUser && (
            <>
              <p>
                <strong>
                  <FaUserAlt className="me-2" />
                  Name:
                </strong>{" "}
                {selectedUser.name}
              </p>
              <p>
                <strong>
                  <FaEnvelope className="me-2" />
                  Email:
                </strong>{" "}
                {selectedUser.email}
              </p>
              <p>
                <strong>
                  <FaUserShield className="me-2" />
                  Role:
                </strong>{" "}
                {selectedUser.role === "user"
                  ? "Customer"
                  : selectedUser.role}
              </p>
              <p>
                <strong>
                  <FaMapMarkerAlt className="me-2" />
                  Branch:
                </strong>{" "}
                {selectedUser.branch?.branchName || "—"}
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer
          style={{ backgroundColor: "#FDFBD8", borderTop: "none" }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
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
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewUsers;
