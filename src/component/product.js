import React, { useState, useEffect, useRef } from 'react';
import { useDownloadExcel } from 'react-export-table-to-excel';

export function Product() {
    const [content, SetContent] = useState(<ProductList showForm={showForm} />);

    function showList() {
        SetContent(<ProductList showForm={showForm} />);
    }

    function showForm(product) {
        SetContent(<ProductForm product={product} showList={showList} />);
    }

    return (
        <div className="container my-5">
            {content}
        </div>
    )
}

function ProductList(props) {
    const [products, SetProducts] = useState([]);
    const tableref = useRef(null);
    const {onDownload} = useDownloadExcel({
        currentTableRef: tableref.current,
        filename: 'InventoryManagementSystem',
        sheet:'IMS'
    })

    function fetchProducts() {
        fetch("http://localhost:3004/products")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Unexpected Server Response");
                }
                return response.json()
            })
            .then((data) => {
                SetProducts(data);
            })
            .catch((error) => {
                console.log("Error:", error);
            });
    }
    useEffect(() => fetchProducts(), []);

    const deleteProduct = (id) => {
        fetch("http://localhost:3004/products/" + id, {
            method: 'DELETE'
        })
            .then((response) => response.json())
            .then((data) => fetchProducts());
    }
    return (
        <>
            <h2 className="text-center mb-3">List of Products</h2>
            <button type="button" className="btn btn-primary me-2" onClick={() => props.showForm({})}>Create</button>
            <button type="button" className="btn btn-outline-primary me-2" onClick={() => fetchProducts()}>Refresh</button>
            <button type="button" className="btn btn-outline-primary me-2" onClick={onDownload}>Export Data</button>
            <table className="table" ref={tableref}>
                <thead>
                    <tr>
                        <td>Id</td>
                        <td>Name</td>
                        <td>Description</td>
                        <td>Quantity</td>
                        <td>Create Date</td>
                        <td>Update Date</td>
                        <td>Action</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        products.map((product, index) => {
                            return (
                                <tr key={index}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.desc}</td>
                                    <td>{product.qty}</td>
                                    <td>{product.createdAt}</td>
                                    <td>{product.updatedAt}</td>
                                    <td style={{ width: "10px", whiteSpace: "nowrap" }}>
                                        <button type="button" onClick={() => props.showForm(product)} className="btn btn-primary btn-sm me-2">Edit</button>
                                        <button type="button" onClick={() => deleteProduct(product.id)} className="btn btn-danger btn-sm">Delete</button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>

            </table>
        </>
    );
}

function ProductForm(props) {
    // const [updateDate, setUpdateDate] = useState();
    const [errorMessage, SetErrorMessage] = useState("");
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const product = Object.fromEntries(formData.entries());

        if (!product.name || !product.qty) {
            console.log("Please enter all required fields!");
            SetErrorMessage(
                <div className="alert alert-warning" role="alert">
                    Please enter all required fields!
                    </div>
            )
            return;
        }

        if (props.product.id) {
            // update the product
            product.updatedAt = new Date().toISOString().slice(0, 10);
            fetch("http://localhost:3004/products/" + props.product.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(product)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Something went wrong");
                    }
                    return response.json()
                })
                .then((data) => props.showList())
                .catch((error) => {
                    console.log("Error:", error);
                });
        }
        else {
            product.createdAt = new Date().toISOString().slice(0, 10);

            fetch("http://localhost:3004/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(product)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Something went wrong");
                    }
                    return response.json()
                })
                .then((data) => props.showList())
                .catch((error) => {
                    console.log("Error:", error);
                });
        }
    }
    return (
        <>
            <h2 className="text-center mb-3">{props.product.id ? "Update product" : "Add new product"}</h2>
            <div className="row">
                <div className="col-lg-6 mx-auto">
                    {errorMessage}
                    <form onSubmit={(event) => handleSubmit(event)}>
                        {props.product.id &&
                            <div className="row mb-3">
                                <label className="col-sm-4 col-form-label">Id</label>
                                <div className="col-sm-8">
                                    <input readOnly className="form-control-plaintext" name="id" defaultValue={props?.product.id} />
                                </div>
                            </div>
                        }
                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Name</label>
                            <div className="col-sm-8">
                                <input className="form-control" name="name" defaultValue={props?.product.name} />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Description</label>
                            <div className="col-sm-8">
                                <textarea className="form-control" name="desc" defaultValue={props?.product.desc} />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Quantity</label>
                            <div className="col-sm-8">
                                <input type="number" className="form-control" name="qty" defaultValue={props?.product.qty} />
                            </div>
                        </div>
                        {/* 
                        {edit ? <div className="row mb-3">
                            <label className="col-sm-4 col-form-label">Update Date</label>
                            <div className="col-sm-8">
                                <DatePicker selected={updateDate} defaultValue="" onChange={(date) => setUpdateDate(date)} name="updateDate" />
                            </div>
                        </div> : null} */}

                        <div className="row">
                            <div className="offset-sm-4 col-sm-4 d-grid">
                                <button type="submit" className="btn btn-primary btn-sm me-3">Save</button>
                            </div>
                            <div className="col-sm-4 d-grid">
                                <button type="button" onClick={() => props.showList()} className="btn btn-secondary me-2">Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}