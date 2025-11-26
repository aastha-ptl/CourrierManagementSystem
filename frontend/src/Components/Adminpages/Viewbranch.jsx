import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Modal, Form, Button } from "react-bootstrap";
import { GeoAlt, PersonFill, PeopleFill, BoxSeam, PencilSquare, Trash } from "react-bootstrap-icons";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

const ViewBranches = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/branches/branches-with-admins");
        setBranches(res.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  return (
    <>
      <div className="container-fluid">
        <h3 className="fw-bold mb-4 mt-2 d-flex align-items-center" style={{ color: "#C76C3F" }}>
          <HiOutlineOfficeBuilding size={26} className="me-2 text-secondary" />
          View All Branches
        </h3>
        <Row className="g-4">
          {branches.map((branch, index) => (
            <Col key={index} xs={12} sm={12} md={6} lg={4}>
              <Card
                className="h-100 shadow-sm border-0 position-relative"
                style={{ backgroundColor: "#FDFBD8" }}
              >
                <Card.Body className="d-flex flex-column position-relative" style={{ minHeight: "200px" }}>
                  {/* Edit Icon Top Right */}
                  <span
                    style={{ position: "absolute", top: 10, right: 40, cursor: "pointer" }}
                    title="Edit Branch"
                    onClick={() => {
                      setEditBranch(branch);
                      setEditName(branch.branchName);
                      setEditAddress(branch.address);
                      setShowModal(true);
                    }}
                  >
                    <PencilSquare size={20} style={{ color: "#C76C3F" }} />
                  </span>
                  {/* Delete Icon Top Right */}
                  <span
                    style={{ position: "absolute", top: 10, right: 10, cursor: "pointer" }}
                    title="Delete Branch"
                    onClick={async () => {
                      const staffCount = branch.staffCount || 0;
                      const courierCount = branch.courierCount || 0;
                      const hasAdmin = branch.branchAdmin ? 1 : 0;
                      const totalUsers = staffCount + hasAdmin;
                      
                      let confirmMsg = `Are you sure you want to delete "${branch.branchName}"?\n\n`;
                      
                      if (totalUsers > 0 || courierCount > 0) {
                        confirmMsg += `This branch has:\n`;
                        if (hasAdmin) confirmMsg += `- 1 Branch Admin\n`;
                        if (staffCount > 0) confirmMsg += `- ${staffCount} Staff member(s)\n`;
                        if (courierCount > 0) confirmMsg += `- ${courierCount} Courier(s)\n`;
                        confirmMsg += `\nThe branch will be deleted, but:\n`;
                        confirmMsg += `✓ Users will be UNASSIGNED (kept in system for reassignment)\n`;
                        confirmMsg += `✓ Couriers will remain in the system for records`;
                      }
                      
                      if (window.confirm(confirmMsg)) {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await axios.delete(
                            `http://localhost:5000/api/branches/delete/${branch._id}?force=true`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          setBranches(branches.filter(b => b._id !== branch._id));
                          const unassignedCount = response.data.usersUnassigned || 0;
                          if (unassignedCount > 0) {
                            alert(`Branch deleted successfully.\n${unassignedCount} user(s) have been unassigned and can be reassigned to other branches.`);
                          } else {
                            alert('Branch deleted successfully');
                          }
                        } catch (err) {
                          alert('Failed to delete branch: ' + (err.response?.data?.message || err.message));
                        }
                      }
                    }}
                  >
                    <Trash size={20} style={{ color: "#dc3545" }} />
                  </span>
                  {/* Top Section */}
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: "#C76C3F" }}>
                      {branch.branchName}
                    </h5>
                    <div className="text-muted mb-2">
                      <GeoAlt size={14} className="me-1" />
                      {branch.city} — {branch.address}
                    </div>
                  </div>
                  {/* Spacer to push admin & bottom section to fixed positions */}
                  <div className="flex-grow-1"></div>
                  {/* Branch Admin (fixed position above staff/couriers) */}
                  <div className="mb-2">
                    <PersonFill className="me-2" style={{ color: "#C76C3F" }} />
                    <strong>Branch Admin:</strong>{" "}
                    {branch.branchAdmin ? branch.branchAdmin.name : "Not Assigned"}
                  </div>
                  {/* Bottom Section */}
                  <div className="d-flex justify-content-between">
                    <span
                      className="p-1 rounded text-dark d-inline-flex align-items-center"
                      style={{ backgroundColor: "#FDFBD4" }}
                    >
                      <PeopleFill className="me-1" style={{ color: "#C76C3F" }} />
                      Staff: {branch.staffCount ?? 0}
                    </span>
                    <span
                      className="p-1 rounded text-dark d-inline-flex align-items-center"
                      style={{ backgroundColor: "#FDFBD4" }}
                    >
                      <BoxSeam className="me-1" style={{ color: "#C76C3F" }} />
                      Couriers: {branch.courierCount ?? 0}
                    </span>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#FDFBD8' }}>
          <Modal.Title style={{ color: '#C76C3F' }}>Edit Branch</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#FDFBD8' }}>
          <Form>
            <Form.Group className="mb-3" controlId="formBranchName">
              <Form.Label style={{ color: '#C76C3F' }}>Branch Name</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{ borderColor: '#C76C3F' }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBranchAddress">
              <Form.Label style={{ color: '#C76C3F' }}>Branch Address</Form.Label>
              <Form.Control
                type="text"
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                style={{ borderColor: '#C76C3F' }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#FDFBD8' }}>
          <Button
            style={{ backgroundColor: '#C76C3F', borderColor: '#C76C3F' }}
            onClick={async () => {
              if (!editBranch) return;
              try {
                const token = localStorage.getItem('token');
                const res = await axios.put(
                  `http://localhost:5000/api/branches/update/${editBranch._id}`,
                  {
                    branchName: editName,
                    address: editAddress,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                // Update local state
                setBranches(branches.map(b =>
                  b._id === editBranch._id ? { ...b, branchName: editName, address: editAddress } : b
                ));
                setShowModal(false);
              } catch (err) {
                alert('Failed to update branch');
              }
            }}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewBranches;
