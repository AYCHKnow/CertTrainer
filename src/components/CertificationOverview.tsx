import * as React from "react";
import { ButtonGroup, DropdownButton, MenuItem, Well } from "react-bootstrap";
import Certification from "../model/Certification";
import QuestionView from "./QuestionView";
import SideNav from "./SideNav";

export interface CertificationOverviewProps {
  match: any;
  location: Location;
 }

interface CertificationOverviewState {
  certification: Certification;
}

export default class CertificationOverview extends React.Component<CertificationOverviewProps, CertificationOverviewState> {
  defaultState: CertificationOverviewState;

  constructor(props: CertificationOverviewProps){
      super(props);

      this.defaultState = {
        certification: null
      };
      this.state = this.defaultState;

      this.loadCourses = this.loadCourses.bind(this);
      this.reset = this.reset.bind(this);
  }

  shouldComponentUpdate(nextProps: CertificationOverviewProps, nextState: CertificationOverviewState){
    if (this.props.location.pathname != nextProps.location.pathname){
      return true;
    }

    if (this.state.certification != nextState.certification) {
      return true;
    }

    return false;
  }

  loadCourses(props: CertificationOverviewProps){
    let courseName = props.match.params.courseName;

    if (!courseName) {
      return;
    }

    fetch("/courses/" + courseName)
      .then(results => {
        return results.json();
      })
      .then(data => {
        this.setState({certification: data as Certification});
      });
  }

  componentDidMount(){
    this.loadCourses(this.props);
  }

  componentWillReceiveProps(props: CertificationOverviewProps){
    if (this.props.location.pathname != props.location.pathname){
      this.reset();
    }

    this.loadCourses(props);
  }

  reset(){
    this.setState(this.defaultState);
  }

  render(){
      let content = (<div>Please select a course from the sidenav</div>);

      if (this.state.certification){
        content = (
          <div>
            <h1>{this.state.certification.name}</h1>
            {this.state.certification.questions ? (this.state.certification.questions.map(q =>
              (<QuestionView question={q} key={q.key} highlightCorrectAnswers={true} highlightIncorrectAnswers={false} answersDisabled={true} />)
            )) : <span>No questions found</span>}
          </div>);
      }

      return (<div>
              <SideNav redirectComponent="certificationOverview" />
              <Well className="col-xs-10 pull-right">
                {content}
              </Well>
          </div>);
  }
}
