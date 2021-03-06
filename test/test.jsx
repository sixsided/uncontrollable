'use strict';
var React = require('react/addons')
var uncontrol = require('../src/uncontrollable')

var TestUtils = React.addons.TestUtils
  , render = TestUtils.renderIntoDocument
  , findTag = TestUtils.findRenderedDOMComponentWithTag
  , findClass = TestUtils.findRenderedDOMComponentWithClass
  , findAllTag = TestUtils.scryRenderedDOMComponentsWithTag
  , findAllClass = TestUtils.scryRenderedDOMComponentsWithClass
  , findType = TestUtils.findRenderedComponentWithType
  , findAllType = TestUtils.scryRenderedComponentWithType
  , trigger = TestUtils.Simulate;

describe('uncontrollable', () =>{
  var Base;

  beforeEach(()=> {
    Base = React.createClass({

      propTypes: {
        value: React.PropTypes.number,
        onChange: React.PropTypes.func,

        open: React.PropTypes.bool,
        onToggle: React.PropTypes.func,
      },

      render() {
        return (
          <div>
            <button onClick={this.props.onToggle}>toggle</button>
            { this.props.open && 
              <span className='open'>open!</span>
            }
            <input 
              value={this.props.value} 
              onChange={ e => this.props.onChange(e.value)}/>
          </div>)
      }
    })
  })

  it('should warn when handlers are missing', () => {
    var warn = sinon.stub(console, 'warn', msg =>{})
      , Control  = uncontrol(Base, { value: 'onChange' })
      , instance = render(<Control value={3}/>)
    
      warn.should.have.been.CalledOnce;

      warn.args[0][0].should.contain(
        'You have provided a `value` prop to `Base` without an `onChange` ' +
        'handler. This will render a read-only field.')

      warn.restore()
  })

  it('should create defaultProp propTypes', () => {
    var Control  = uncontrol(Base, { value: 'onChange' })

    Control.propTypes.should.have.property('defaultValue')
      .that.equals(Base.propTypes.value)
  })

  it('should track state if no specified', () => {
    var Control  = uncontrol(Base, { value: 'onChange' })
      , instance = render(<Control />)
      , input = findTag(instance, 'input')
    
    trigger.change(input.getDOMNode(), { value: 42})

    instance.state.should.have.property('value')
      .that.equals(42)
  })

  it('should allow for defaultProp', () => {
    var Control  = uncontrol(Base, { value: 'onChange', open: 'onToggle' })
      , instance = render(<Control defaultValue={10} defaultOpen />)
      , input = findTag(instance, 'input')
      , span = findClass(instance, 'open')
    
    input.getDOMNode().value.should.equal('10')

    trigger.change(input.getDOMNode(), { value: 42})

    instance.state.value.should.equal(42)
  })

  describe('taps', () => {

    it('should call the tap function before the handler', ()=> {
      var tap = sinon.spy()
        , onChange = sinon.spy()
        , Control  = uncontrol(Base, { value: 'onChange' }, { 'onChange': tap })
        , instance = render(<Control defaultValue={10} onChange={onChange}/>)
        , input = findTag(instance, 'input');

      trigger.change(input.getDOMNode(), { value: 42 })

      tap.should.have.been.CalledOnce
      tap.should.have.been.calledBefore(onChange)
      onChange.should.have.been.CalledOnce
    })

    it('should call the tap function this `this` as the wrapping component', ()=> {
      var tap = sinon.spy(function(){ this.should.equal(instance) })
        , Control  = uncontrol(Base, { value: 'onChange' }, { 'onChange': tap })
        , instance = render(<Control defaultValue={10}/>)
        , input = findTag(instance, 'input');

      trigger.change(input.getDOMNode(), { value: 42 })

      tap.should.have.been.CalledOnce
    })
  })
})

