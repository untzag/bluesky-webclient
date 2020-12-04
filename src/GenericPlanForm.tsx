import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { IAllowedPlans, IParameter, ISumbitPlanObject } from './queueserver';
import { Box, Button, Grid, GridList, GridListTile, List, ListItem, ListItemText, Select, Switch, TextField, Tooltip } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';

type IProps = {
  name: string;
  allowedPlans: IAllowedPlans;
  submitPlan: (selectedPlan: ISumbitPlanObject) => void;
}

interface IState {
  plan: ISumbitPlanObject;
}

export class GenericPlanForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      plan: {name: this.props.name,
             kwargs: {}}
    }
  }

  _onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, id, value } = e.target;
    const new_plan = this.state.plan;
    new_plan.kwargs[name][Number(id)] = value;
    this.setState({
        plan: new_plan
    });
  }

  _addParameter(name: string){
    const new_plan = this.state.plan;
    new_plan.kwargs[name].push("");
    this.setState({
        plan: new_plan
    });
  }

  _removeParameter(name: string){
    if (this.state.plan.kwargs[name].length > 1){
      const new_plan = this.state.plan;
      new_plan.kwargs[name].pop();
      this.setState({
          plan: new_plan
      });
    }
  }

  _submit(){
    const new_plan = this.state.plan;
    new_plan.name = this.props.name;
    this.setState({
        plan: new_plan
    });
    this.props.submitPlan(this.state.plan)
  }

  _get_widget_list(parameterObject: IParameter): JSX.Element[]|JSX.Element {
      if (this.state.plan.kwargs[parameterObject.name] === undefined){
        return <Card />
      } else {
        return this.state.plan.kwargs[parameterObject.name].map(() =>
        (<ListItem dense={true}>
          {this._get_widget(parameterObject)}
        </ListItem>))
      }                                            
  }

  _get_widget(parameterObject: IParameter): JSX.Element {
    const widgetDict : Record<string, JSX.Element> = {'number': <TextField  name={parameterObject.name}
                                                                            id={String(this.state.plan.kwargs[parameterObject.name].length-1)}
                                                                            defaultValue={parameterObject.default}
                                                                            onChange={this._onChange.bind(this)}
                                                                            variant="outlined"/>,
                                                      'boolean': <Switch name={parameterObject.name}
                                                                          id={String(this.state.plan.kwargs[parameterObject.name].length-1)}
                                                                          defaultValue={parameterObject.default}
                                                                          onChange={this._onChange.bind(this)}/>,
                                                      'str': <TextField name={parameterObject.name}
                                                                           id={String(this.state.plan.kwargs[parameterObject.name].length-1)}
                                                                           defaultValue={parameterObject.default}
                                                                           onChange={this._onChange.bind(this)}
                                                                           variant="outlined"/>,
                                                      'enum': <Select name={parameterObject.name}
                                                                      id={String(this.state.plan.kwargs[parameterObject.name].length-1)}
                                                                      defaultValue={parameterObject.default}/>,
                                                      'default': <TextField name={parameterObject.name}
                                                                            id={String(this.state.plan.kwargs[parameterObject.name].length-1)}
                                                                            defaultValue={parameterObject.default}
                                                                            onChange={this._onChange.bind(this)}
                                                                            margin="dense"
                                                                            variant="outlined"/>}

    return widgetDict[parameterObject.type] ? widgetDict[parameterObject.type] : widgetDict['default']
  }

  static getDerivedStateFromProps(props : IProps, current_state: IState) {
    const temp_dict: Record<string, (string|number)[]> = {};
    if (current_state.plan.name !== props.name) {
      var i;
      for (i = 0; i < props.allowedPlans.plans_allowed[props.name].parameters.length; i++) {
        if (props.allowedPlans.plans_allowed[props.name].parameters[i].default){
          temp_dict[props.allowedPlans.plans_allowed[props.name].parameters[i].name] = [props.allowedPlans.plans_allowed[props.name].parameters[i].default];
        } else {
          temp_dict[props.allowedPlans.plans_allowed[props.name].parameters[i].name] = [""];
        }
      }
      return {
        plan: {name: props.name,
               kwargs: temp_dict}
      }
    } else {
      return null;
    }
  }

  render(){
    return (
          <Card raised={true}>
            <CardContent>
              <div>
                <GridList spacing={3} cellHeight="auto">
                  <GridListTile key="Subheader" cols={2} style={{ color: "black", border:5, height: 'auto'}}>
                    <Box borderBottom={3}>
                      <Typography align="center" variant="h5" component="h1" >
                        {this.props.name}
                      </Typography>
                      <Typography align="center" gutterBottom>
                        {this.props.allowedPlans.plans_allowed[this.props.name]["description"] ?
                          this.props.allowedPlans.plans_allowed[this.props.name]["description"] : "No plan description found."}
                      </Typography>
                    </Box>
                  </GridListTile>
                  {this.props.allowedPlans.plans_allowed[this.props.name].parameters.map(
                    (parameterObject: IParameter) => (
                      <GridListTile style={{ height: 'auto' }}>
                        <Grid container spacing={0} direction="row" justify="center" alignItems="center" wrap="nowrap">
                          <Grid item justify="center" spacing={1} xs={4}>
                            {parameterObject.description ?
                            <Tooltip title={parameterObject.description} arrow={true}>
                              <ListItemText primary={parameterObject.name} />
                            </Tooltip> : <ListItemText primary={parameterObject.name} />}
                          </Grid>
                          <Grid item justify="space-evenly" spacing={1} xs={6}>
                            <List dense={true}>
                              {this._get_widget_list(parameterObject)}
                            </List>
                          </Grid>
                            {parameterObject.name.slice(-1) === 's' ?
                                  <Grid item justify="flex-end" xs={3}>
                                    <IconButton size="small" onClick={() => this._addParameter(parameterObject.name)}>
                                      <AddCircleOutlineIcon />
                                    </IconButton>
                                    {(this.state.plan.kwargs[parameterObject.name] && this.state.plan.kwargs[parameterObject.name].length > 1) ?
                                      <IconButton size="small" onClick={() => this._removeParameter(parameterObject.name)}>
                                        <RemoveCircleOutlineIcon />
                                      </IconButton> : null
                                    }
                                  </Grid> : <Grid item justify="flex-end" xs={3} />}
                        </Grid>
                      </GridListTile>
                  ))}
                </GridList>
              </div>
              
            </CardContent>
            <CardActions disableSpacing style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => this._submit()}  variant="contained" color="primary">
                submit
              </Button>
            </CardActions>
          </Card>
    );
  }
}