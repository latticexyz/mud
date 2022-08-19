package multiplexer

type Multiplexer struct {
	stopChannel    chan struct{}
	publishChannel chan interface{}
	subChannel     chan chan interface{}
	unsubChannel   chan chan interface{}
}

func NewMultiplexer() *Multiplexer {
	return &Multiplexer{
		stopChannel:    make(chan struct{}),
		publishChannel: make(chan interface{}, 1),
		subChannel:     make(chan chan interface{}, 1),
		unsubChannel:   make(chan chan interface{}, 1),
	}
}

func (m *Multiplexer) Start() {
	subs := map[chan interface{}]struct{}{}
	for {
		select {
		case <-m.stopChannel:
			return
		case msgChannel := <-m.subChannel:
			subs[msgChannel] = struct{}{}
		case msgChannel := <-m.unsubChannel:
			delete(subs, msgChannel)
		case msg := <-m.publishChannel:
			for msgChannel := range subs {
				select {
				case msgChannel <- msg:
				default:
				}
			}
		}
	}
}

func (m *Multiplexer) Stop() {
	close(m.stopChannel)
}

func (m *Multiplexer) Subscribe() chan interface{} {
	msgChannel := make(chan interface{}, 5)
	m.subChannel <- msgChannel
	return msgChannel
}

func (m *Multiplexer) Unsubscribe(msgChannel chan interface{}) {
	m.unsubChannel <- msgChannel
}

func (m *Multiplexer) Publish(msg interface{}) {
	m.publishChannel <- msg
}
