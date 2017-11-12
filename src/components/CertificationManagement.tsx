import * as React from "react";
import { ButtonGroup, ButtonToolbar, Button, MenuItem, Well } from "react-bootstrap";
import Certification from "../model/Certification";
import QuestionEditView from "./QuestionEditView";
import SideNav from "./SideNav";
import FieldGroup from "./FieldGroup";
import MessageBar from "./MessageBar";
import ValidationResult from "../model/ValidationResult";
import * as uuid from "uuid/v4";
import Question from "../model/Question";
import { LinkContainer } from "react-router-bootstrap";

export interface CertificationManagementProps {
  match: any;
  location: Location;
 }

interface CertificationManagementState {
  certification: Certification;
  activeQuestion: number;
  errors: Array<string>;
  message: string;
}

export default class CertificationManagement extends React.Component<CertificationManagementProps, CertificationManagementState> {
  defaultState: CertificationManagementState;

  constructor(props: CertificationManagementProps){
      super(props);

      this.defaultState = {
        certification: null,
        activeQuestion: 0,
        errors: [],
        message: ""
      };
      this.state = this.defaultState;

      this.loadCourses = this.loadCourses.bind(this);
      this.reset = this.reset.bind(this);
      this.save = this.save.bind(this);
      this.onNameChange = this.onNameChange.bind(this);
      this.onQuestionChange = this.onQuestionChange.bind(this);
      this.addQuestion = this.addQuestion.bind(this);
      this.deleteQuestion = this.deleteQuestion.bind(this);
      this.setIds = this.setIds.bind(this);
  }

  shouldComponentUpdate(nextProps: CertificationManagementProps, nextState: CertificationManagementState){
    if (this.props.location.pathname != nextProps.location.pathname){
      return true;
    }

    if (this.state.certification != nextState.certification) {
      return true;
    }

    if (this.state.activeQuestion != nextState.activeQuestion) {
      return true;
    }

    if (this.state.message != nextState.message) {
      return true;
    }

    if (JSON.stringify(this.state.errors) !== JSON.stringify(nextState.errors)) {
      return true;
    }

    return false;
  }

  setIds(cert: Certification){
    if (!cert.id) {
      cert.id = uuid();
    }

    for (let i = 0; cert.questions && i < cert.questions.length; i++){
      let question = cert.questions[i];

      if (!question.id) {
        question.id = uuid();
      }

      for (let j = 0; question.answers && j < question.answers.length; j++){
        let answer = question.answers[j];

        if (!answer.id) {
          answer.id = uuid();
        }
      }
    }

    return cert;
  }

  loadCourses(props: CertificationManagementProps){
    let courseName = props.match.params.courseName;

    if (!courseName) {
      return;
    }
    else if(courseName === "new") {
      this.setState({certification: new Certification({id: uuid()})});
      return;
    }

    fetch("/courses/" + courseName)
      .then(results => {
        return results.json();
      })
      .then(data => {
        let cert = this.setIds(data as Certification);

        this.setState({certification: cert});
      });
  }

  componentDidMount(){
    this.loadCourses(this.props);
  }

  componentWillReceiveProps(props: CertificationManagementProps){
    if (this.props.location.pathname != props.location.pathname){
      this.reset();
    }

    this.loadCourses(props);
  }

  reset(){
    this.setState(this.defaultState);
  }

  save(){
    let headers = new Headers();
    headers.set("Content-Type", "application/json");

    fetch("/certificationUpload",
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(this.state.certification),
    })
    .then(results => {
      return results.json();
    })
    .then((data: ValidationResult) => {
      if (data.success){
        this.setState({message: "Saved successfully", errors: []});
      }
      else {
        this.setState({errors: data.errors});
      }
    })
    .catch(err => {
        this.setState({errors: [err.message]});
    });
  }

  onNameChange(e: any){
    let cert = this.state.certification;
    let newName = e.target.value;
    let update = {...cert, name: newName};

    this.setState({
      certification: update
    });
  }

  onQuestionChange(index: number, question: Question){
    let certification = this.state.certification;
    let questions = (certification.questions || []).map((value, i) => i != index ? value : question);
    let update = {...certification, questions: questions};

    this.setState({certification: update});
  }

  deleteQuestion = (index: number) => {
    let certification = this.state.certification;
    let questions = (certification.questions || []).filter((value, i) => i != index);
    let update = {...certification, questions: questions};

    this.setState({certification: update});
  }

  addQuestion(){
    let certification = this.state.certification;
    let questions = (certification.questions || []).concat(new Question({id: uuid()}));
    let update = {...certification, questions: questions};

    this.setState({certification: update});
  }

  render(){
      let content = (<div>Please select a course from the sidenav, or click the new button for creating a new course</div>);

      if (this.state.certification){
        content = (
          <div id={this.state.certification.id + "header"}>
            <FieldGroup
              id={this.state.certification.id + "name"}
              control={{type: "text", value: this.state.certification.name, onChange: this.onNameChange}}
              label="Certification Name"
            />
            {this.state.certification.questions ? (this.state.certification.questions.map((q, index) =>
              (<QuestionEditView onQuestionChange={(q: Question) => this.onQuestionChange(index, q)} requestDeletion={() => this.deleteQuestion(index)} question={q} key={q.id} />)
            )) : <span>No questions found</span>}
            </div>);
      }

      return (<div>
                <SideNav redirectComponent="certificationManagement" />
                <div className="col-xs-10 pull-right">
                  <ButtonToolbar>
                    <ButtonGroup>
                      <LinkContainer key={"newLink"} to={"/certificationManagement/new"}>
                        <Button>Create New Certification</Button>
                      </LinkContainer>
                      <Button onClick={this.addQuestion} type="submit">Add Question</Button>
                      <Button onClick={this.save} type="submit">Save</Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                  <MessageBar message={this.state.message} errors={this.state.errors} />
                  <Well>
                    {content}
                  </Well>
                </div>
              </div>);
  }
}
