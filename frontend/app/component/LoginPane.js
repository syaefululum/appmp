import React from 'react';
import { Link } from 'react-router';
import autoBind from 'react-autobind';
import cookie from 'react-cookie';
import SweetAlert from 'sweetalert-react';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';

import ProductRow from './ProductRow';

import backend from '../configs/backend';
import frontend from '../configs/frontend';

import 'sweetalert/dist/sweetalert.css';


class LoginPane extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            user: "",
            email: "",
            password: "",
            loading: false,
            alert_show: false,
            alert_title: "",
            alert_message: "",
            alert_type: "info",
            alert_confirm_button: true,
            errors: {}
        }

        this.validatorTypes = strategy.createSchema(
            // First parameter is a list of rules for each element name
            {
                user: 'required|email',
                password: 'required'
            },
            // Second parameter is optional and is a list of custom error messages for elements
            {
                "required.user": "Without an :attribute we can't reach you!"
            },
            // Third parameter is also optional; a callback that takes the validator instance created
            // and can be used to call methods on it. This is run at the point of validation.
            function (validator) {

            }
        );
    }

    _create() {
        this.setState({
            alert_show: true,
            alert_title: "Logging In",
            alert_type: "info",
            alert_confirm_button: false,
            alert_message: "Please Wait . . ."
        });
        return $.ajax({
            url: backend.url + '/api/auth/token',
            type: 'POST',
            data: {
                username: this.state.user,
                password: this.state.password
            },
            beforeSend: function () {
                this.setState({ alert_show: true, alert_title: "Loggin In", alert_message: "Please wait . . ." });
            }.bind(this)
        })
    }
    _onSubmit(e) {
        e.preventDefault();
        var login = this;
        this.props.validate()
        this.props.validate(function (error) {
            if (!error) {
                var xhr = login._create();
                xhr.done(login._onSuccess)
                    .fail(login._onError)
                    .always(login.hideLoading)
            }
        });

    }
    _onSuccess(data) {
        console.log(data);
        console.log("success");
        cookie.save('token', data.access_token);

        window.location.href = frontend.url;
    }
    _onError(data) {
        var response = data.responseJSON;
        console.log(response.error);
        console.log(response.message);
        this.setState({
            alert_show: true,
            alert_title: "Error",
            alert_type: "error",
            alert_confirm_button: true,
            alert_message: response.message
        });
    }
    _onChange(e) {
        var state = {};
        state[e.target.name] = $.trim(e.target.value);
        this.setState(state);
    }

    getValidatorData() {
        return this.state;
    }

    getClassName(field) {
        return this.props.isValid(field) ? '' : 'has-error';
    }

    renderErrors(messages) {
        if (messages.length) {
            console.log(messages);
            messages = messages.map((message) => <li className="">{message}</li>);
            return <ul className="errors">{messages}</ul>;
        }
    }


    render() {
        return (
            <div className="ibox-content">
                <div className="row">

                    <div className="col-md-4 col-md-offset-4">
                        <div className="row text-center">
                            <h3>Login to One Stop Clicking</h3>
                        </div>
                        <form ref='login_form' onSubmit={this._onSubmit}>
                            <div className={this.getClassName('user') + " form-group"}>
                                <input
                                    type="text"
                                    className="form-control"
                                    onChange={this._onChange}
                                    id="user"
                                    name="user"
                                    placeholder="Email" />

                                {this.renderErrors(this.props.getValidationMessages('user'))}
                            </div>

                            <div className={this.getClassName('password') + " form-group"}  >
                                <input
                                    type="password"
                                    className=" form-control"
                                    onChange={this._onChange}
                                    id="password"
                                    name="password"
                                    placeholder="Password" />

                                {this.renderErrors(this.props.getValidationMessages('password'))}
                            </div>

                            <button className="btn btn-success block full-width m-b">Login</button>
                            <br />
                            <a href="#">
                                <small>Forgot password?</small>
                            </a>

                            <p className="text-muted text-center">
                                <small>Do not have an account?</small>
                            </p>
                            <Link className="btn btn-sm btn-white btn-block" to={'/register'}>Create an account </Link>
                        </form>
                    </div>
                </div>
                <SweetAlert
                    show={this.state.alert_show}
                    title={this.state.alert_title}
                    text={this.state.alert_message}
                    type={this.state.alert_type}
                    showConfirmButton={this.state.alert_confirm_button}
                    onConfirm={() => this.setState({ alert_show: false })}
                    onOutsideClick={() => this.setState({ alert_show: false })}
                    />
            </div >
        )
    }
};

LoginPane = validation(strategy)(LoginPane);

export default LoginPane;