import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Button, Modal, Form, Table } from "react-bootstrap";
import { PersonXFill, PersonCheckFill } from "react-bootstrap-icons";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";

const UnassignedUsers = () => {
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState({ value: "All", label: "All" });
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    fetchUnassignedUsers();
    fetchBranches();
  }, []);

  const fetchUnassignedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/unassigned-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnassignedUsers(res.data);
    } catch (error) {
      console.error("Error fetching unassigned users:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const token = localStorage.getItem("token");
      console.log("Fetching branches with token:", !!token);
      const res = await axios.get("http://localhost:5000/api/branches/getallbranchesname", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Branches fetched:", res.data);
      // Format branches for react-select
      const formatted = res.data.map((branch) => ({
        value: branch._id,
        label: branch.branchName,
      }));
      setBranches(formatted);
    } catch (error) {
      console.error("Error fetching branches:", error);
      console.error("Error response:", error.response);
      alert("Failed to fetch branches: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedBranch) {
      alert("Please select a branch");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/admin/reassign-user",
        {
          userId: selectedUser._id,
          branchId: selectedBranch.value, // Use .value from react-select
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`${selectedUser.name} has been successfully reassigned!`);
      setShowModal(false);
      setSelectedUser(null);
      setSelectedBranch("");
      fetchUnassignedUsers();
    } catch (error) {
      alert("Failed to reassign user: " + (error.response?.data?.message || error.message));
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

  const roleOptions = [
    { value: "All", label: "All" },
    { value: "branchadmin", label: "Branch Admin" },
    { value: "staff", label: "Staff" }
  ];

  // Filter users by search term and role
  const filteredUsers = unassignedUsers.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole.value === "All" || user.role === selectedRole.value;
    return matchesName && matchesRole;
  });

  return (
    <>
      <div className="container-fluid">
        <h3 className="fw-bold mb-4 mt-2 d-flex align-items-center" style={{ color: "#C76C3F" }}>
          <PersonXFill size={26} className="me-2 text-secondary" />
          Manage Unassigned Personnel
        </h3>

        {/* Filter and Search Section */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Label><strong>Filter by Role</strong></Form.Label>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              placeholder="Select Role"
              styles={selectStyles}
            />
          </Col>

          <Col md={4}>
            <Form.Label><strong>Search by Name</strong></Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                type="text"
                placeholder="Search personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  paddingLeft: "40px",
                  borderColor: isFocused ? "#C76C3F" : "#ced4da",
                  boxShadow: isFocused ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)" : "none"
                }}
              />
              <FaSearch
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#C76C3F",
                }}
              />
            </div>
          </Col>
        </Row>

        {filteredUsers.length === 0 ? (
          <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
            <Card.Body className="text-center py-5">
              <PersonCheckFill size={50} style={{ color: "#28a745" }} className="mb-3" />
              <h5>No unassigned personnel found!</h5>
              <p className="text-muted">
                {unassignedUsers.length === 0 
                  ? "All users are assigned to branches." 
                  : "Try adjusting your search or filter."}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Table bordered responsive>
            <thead className="custom-thead">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: user.role === "branchadmin" ? "#C76C3F" : "#6c757d",
                      }}
                    >
                      {user.role === "branchadmin" ? "Branch Admin" : "Staff"}
                    </span>
                  </td>
                  <td>
                    {user.isActive === false && (
                      <span className="badge bg-danger">
                        Deactivated
                      </span>
                    )}
                    {user.isActive !== false && (
                      <span className="badge bg-secondary">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      style={{ backgroundColor: "#C76C3F", borderColor: "#C76C3F" }}
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedBranch(null);
                        setShowModal(true);
                        if (branches.length === 0) {
                          fetchBranches();
                        }
                      }}
                    >
                      Reassign to Branch
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Reassign Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#FDFBD8" }}>
          <Modal.Title style={{ color: "#C76C3F" }}>
            Reassign User to Branch
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#FDFBD8" }}>
          {selectedUser && (
            <>
              <p>
                <strong>User:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                {selectedUser.role === "branchadmin" ? "Branch Admin" : "Staff"}
              </p>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#C76C3F" }}>Select Branch</Form.Label>
                <Select
                  options={branches}
                  placeholder={loadingBranches ? "Loading branches..." : "Select branch"}
                  isSearchable
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  isDisabled={loadingBranches}
                  styles={selectStyles}
                />
                {!loadingBranches && branches.length === 0 && (
                  <small className="text-danger d-block mt-1">
                    No branches available. Please add branches first.
                  </small>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#FDFBD8" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#C76C3F", borderColor: "#C76C3F" }}
            onClick={handleReassign}
          >
            Reassign
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UnassignedUsers;
